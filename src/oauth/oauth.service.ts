import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { AuthProvider } from 'src/common/enums/auth-provider.enum';
import { User, UserLinkedAccount } from 'src/schemas/user.schema';

@Injectable()
export class OauthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
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
  private async createOauthUser(oauthProfileData: {
    provider: AuthProvider;
    providerId: string;
    profilePic?: string;
    email?: string;
    isEmailVerified?: boolean;
  }) {
    /* 
      If there is an 'email' property in the oauth profile data:
      - if the oauth provider is 'google', set the 'email' value on the user document no matter whether the email is verified or not
      - otherwise only populate the email field if 'isEmailVerified' is true
    */
    const { provider, providerId, profilePic, email, isEmailVerified } =
      oauthProfileData;
    const newUserData: User = {
      originalProvider: provider,
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
    oauthProfileData: {
      profilePic?: string;
      email?: string;
      isEmailVerified?: boolean;
    },
  ) {
    const { userId, originalProvider } = userData;
    /* 
      - if the original provider is not 'google' and the user does not have an email, set the email value with the new oauth profile email value (if it is verified)
      - otherwise, do not update the email value
    */
    const { profilePic, email, isEmailVerified } = oauthProfileData;
    const profileUpdateData: UpdateQuery<User> = {
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
    meant to be used after all of the validations/checks have been passed and all of the confitions have been met 
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

  async handleOauthLogin(oauthProfileData: {
    provider: AuthProvider;
    providerId: string;
    profilePic?: string;
    email?: string;
    isEmailVerified?: boolean;
  }) {
    const { provider, providerId, profilePic, email, isEmailVerified } =
      oauthProfileData;
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
            userId: user._id.toHexString(),
            originalProvider: user.originalProvider,
          },
          {
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
      return this.linkProviderToUser(existingEmailUser._id.toHexString(), {
        provider,
        providerId,
      });
    }

    /*
      Reaching this point means that 
        - there are no users who have linked or created an account with the current provider data
        - either the current provider profile data does not contain an 'email' value that is not null or the email is not verified
        - or there are no users with the same email as the current provider profile data
      So we simply can create a new user account with the current provider profile data
    */
    return this.createOauthUser(oauthProfileData);
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
    if (existingLink && existingLink._id.toHexString() === userId) {
      throw new BadRequestException({
        message: 'This account is already linked to your account',
      });
    }
    if (existingLink && existingLink._id.toHexString() != userId) {
      throw new ConflictException({
        message: 'This account is already linked to another user',
      });
    }
    return this.linkProviderToUser(userId, providerData);
  }
}
