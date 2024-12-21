import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model, UpdateQuery } from 'mongoose';
import { DEFAULT_COOKIE_OPTIONS } from 'src/auth/constants/default-cookie-options';
import { CookieKey } from 'src/auth/enums/cookie-key.enum';
import { WebLoginResponse } from 'src/auth/types/login.response.type';
import { AuthProvider } from 'src/common/enums/auth-provider.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { SignJWTInput } from 'src/common/types/sign-jwt.input.type';
import { UserRefreshTokensService } from 'src/refresh-tokens/services/user.refresh-tokens.service';
import { UAPayload } from 'src/refresh-tokens/types/refresh-token-payload.type';
import {
  User,
  UserLinkedAccount,
  UserWithTimestamps,
} from 'src/schemas/user.schema';
import { OauthProfilePayload } from './types/oauth-profile-payload.type';
import { UpdateOauthProfilePayload } from './types/update-oauth-profile.payload.type';

@Injectable()
export class OauthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserWithTimestamps>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRefreshTokenService: UserRefreshTokensService,
  ) {}

  /**
   * create a new user account with the given oauth profile data.
   *
   * ### NOTE:
   * - This method is meant to be used as a helper method for the 'handleOauthLogin' method.
   * - This method assumes that all of the validatons regarding whether the oauth profile has been already linked to some other user account have been performed.
   * @param oauthProfileData
   * @returns User
   */
  private async createOauthUser(
    oauthProfileData: OauthProfilePayload,
  ): Promise<UserWithTimestamps> {
    /* 
      If there is an 'email' property in the oauth profile data:
      - if the oauth provider is 'google', set the 'email' value on the user document no matter whether the email is verified or not
      - otherwise only populate the email field if 'isEmailVerified' is true
    */
    const {
      provider,
      providerId,
      displayName,
      profilePic,
      email,
      isEmailVerified,
    } = oauthProfileData;
    const newUserData: User = {
      originalProvider: provider,
      displayName,
      linkedAccounts: [
        {
          provider,
          providerId,
        },
      ],
      profilePic,
    };
    if (email && (provider === AuthProvider.GOOGLE || isEmailVerified)) {
      newUserData.email = email;
    }
    return new this.userModel(newUserData).save();
  }

  private async updateOauthProfile(
    userData: {
      userId: string;
      originalProvider: AuthProvider;
    },
    oauthProfileData: UpdateOauthProfilePayload,
  ): Promise<UserWithTimestamps> {
    const { userId, originalProvider } = userData;
    /* 
      - if the original provider is not 'google' and the user does not have an email, set the email value with the new oauth profile email value (if it is verified)
      - otherwise, do not update the email value
    */
    const { displayName, profilePic, email, isEmailVerified } =
      oauthProfileData;
    const profileUpdateData: UpdateQuery<User> = {
      displayName,
      ...(profilePic && {
        profilePic,
      }),
    };
    if (originalProvider !== AuthProvider.GOOGLE && !email && isEmailVerified) {
      profileUpdateData.email = email;
    }
    return this.userModel.findByIdAndUpdate(userId, profileUpdateData, {
      new: true,
    });
  }

  /* 
    meant to be used after all of the validations/checks have been passed and all of the conditions have been met 
  */
  private async linkProviderToUser(
    userId: string,
    providerData: UserLinkedAccount,
  ) {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          linkedAccounts: providerData,
        },
      },
      {
        new: true,
      },
    );
  }

  /* meant to be used in the passport oauth strategy validate() method */
  async upsertOauthUser(
    oauthProfileData: OauthProfilePayload,
  ): Promise<UserWithTimestamps> {
    const {
      provider,
      providerId,
      displayName,
      profilePic,
      email,
      isEmailVerified,
    } = oauthProfileData;
    const user = await this.userModel.findOne({
      linkedAccounts: {
        $elemMatch: {
          provider,
          providerId,
        },
      },
    });
    /* 
      if there is already a user who has linked this oauth provider profile on their account 
    */
    if (user) {
      /* 
        - if the current provider is the original provider that was used to register the user, update the user profile with the current profile data
        - otherwise (meaning the current provider was linked later), just return the user
      */
      if (user.originalProvider === provider) {
        return this.updateOauthProfile(
          {
            userId: String(user._id),
            originalProvider: user.originalProvider,
          },
          {
            displayName,
            profilePic,
            email,
            isEmailVerified,
          },
        );
      }
      return user;
    }

    /* 
      NOTE: Reaching this point means that there are no users who have linked or created an account with the current provider data
      If the current provider profile data contains an 'email' value that is not null,
      and if the email is verified, we can check if there is a user with the same email
      If yes, we can link the current provider profile to the user account
    */
    if (email && isEmailVerified) {
      const existingEmailUser = await this.userModel.findOne({
        email,
      });
      return this.linkProviderToUser(String(existingEmailUser._id), {
        provider,
        providerId,
      });
    }

    /*
      Reaching this point means that 
        - there are no users who have linked or created an account with the current provider data
        - either the current provider profile data does not contain an 'email' value that is not null or the email is not verified
        - or there are no users whose email matches the current provider profile email
      So we can simply create a new user account with the current provider profile data
    */
    return this.createOauthUser(oauthProfileData);
  }

  // TODO: refactor the abstract auth service 'getCookiesExpiryDateTime' and 'setAuthCookies' methods into a separate service
  async webLogin(
    user: UserWithTimestamps,
    uaPayload: UAPayload,
    response: Response,
  ): Promise<WebLoginResponse> {
    const jwtPayload: SignJWTInput = {
      sub: user._id as string,
      role: UserRole.USER,
    };
    const authCookieExpiryDateTime = new Date();
    const authCookieExpiresIn =
      this.configService.getOrThrow<number>('jwt.expiresIn');
    authCookieExpiryDateTime.setSeconds(
      authCookieExpiryDateTime.getSeconds() + authCookieExpiresIn,
    );
    const refreshCookieExpiryDateTime = new Date();
    const refreshCookieExpiresIn = this.configService.getOrThrow<number>(
      'jwt.refreshTokenExpiresIn',
    );
    refreshCookieExpiryDateTime.setSeconds(
      refreshCookieExpiryDateTime.getSeconds() + refreshCookieExpiresIn,
    );
    const accessToken = this.jwtService.sign(jwtPayload);
    const refreshToken =
      await this.userRefreshTokenService.generateRefreshToken({
        ...uaPayload,
        user: user._id as string,
        expiresAt: refreshCookieExpiryDateTime,
      });
    response.cookie(CookieKey.AccessToken, accessToken, {
      ...DEFAULT_COOKIE_OPTIONS,
      expires: authCookieExpiryDateTime,
    });
    response.cookie(CookieKey.RefreshToken, refreshToken, {
      ...DEFAULT_COOKIE_OPTIONS,
      path: '/auth',
      expires: refreshCookieExpiryDateTime,
    });
    return {
      data: {
        email: user.email,
        gender: user.gender,
        profilePic: user.profilePic,
        status: user.status,
        username: user.username,
      },
    };
  }

  /* 
    meant to be used directly as a route handler service 
  */
  async linkOauthAccount(userId: string, providerData: UserLinkedAccount) {
    const existingLink = await this.userModel.findOne({
      linkedAccounts: {
        $elemMatch: providerData,
      },
    });
    if (existingLink && String(existingLink._id) === userId) {
      throw new BadRequestException({
        message: 'This account is already linked to your account',
      });
    }
    if (existingLink && String(existingLink._id) != userId) {
      throw new ConflictException({
        message: 'This account is already linked to another user',
      });
    }
    return this.linkProviderToUser(userId, providerData);
  }
}
