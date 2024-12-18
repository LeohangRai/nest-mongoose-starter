import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import mongoose, { Connection, Model, RootFilterQuery } from 'mongoose';
import { RegisterUserDto } from 'src/auth/dtos/register-user.dto';
import { UserProfileSerializer } from 'src/auth/serializers/user-profile.serializer';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_PAGE,
} from 'src/common/dtos/query.dto';
import { SortDirection } from 'src/common/enums/sort-direction.enum';
import {
  hashPassword,
  isPasswordMatch,
} from 'src/common/helpers/crypto/bcrypt.helper';
import { ThrowableOptions } from 'src/common/types/throwable-opts';
import { ValidationErrorMessage } from 'src/common/types/validation-error-message.type';
import { getKeywordFilter } from 'src/common/utils/get-keyword-filter';
import { Post } from 'src/schemas/post.schema';
import { UserSettings } from 'src/schemas/user-settings.schema';
import {
  User,
  UserModelFields,
  UserWithTimestamps,
} from 'src/schemas/user.schema';
import { GetUsersQueryDto } from './dtos/get-users.query.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UPDATED_USER_PROJECTION } from './projections/updated-user.projection';
import { USER_DETAILS_PROJECTION } from './projections/user-details.projection';
import { USER_POSTS_PROJECTION } from './projections/user-posts.projection';
import { USER_PROFILE_PROJECTION } from './projections/user-profile.projection';
import { USER_SETTINGS_PROJECTION } from './projections/user-settings.projection';
import { USERS_LIST_PROJECTION } from './projections/users-list.projection';

@Injectable()
export class UsersService {
  private defaultQueryPage = DEFAULT_QUERY_PAGE;
  private defaultQueryLimit = DEFAULT_QUERY_LIMIT;
  private keywordFilterFields: UserModelFields[] = ['username', 'email'];
  private sortableFields: UserModelFields[] = [
    'createdAt',
    'updatedAt',
    'username',
    'email',
    'gender',
  ];
  private defaultSortField: UserModelFields = 'createdAt';
  private defaultSortDirection = SortDirection.DESCENDING;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
    @InjectModel(Post.name)
    private postModel: Model<Post>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private serializeUserProfile(user: Partial<User>) {
    return plainToClass(UserProfileSerializer, user, {
      excludeExtraneousValues: true,
    });
  }

  validateSortByField(sortBy: string) {
    if (!sortBy) return;
    if (!this.sortableFields.includes(sortBy as UserModelFields)) {
      const validationErrorObj: ValidationErrorMessage = {
        property: 'sortBy',
        message: `sortBy must be one of the following values: ${this.sortableFields.join(
          ', ',
        )}`,
      };
      throw new UnprocessableEntityException([validationErrorObj]);
    }
  }

  get(query: GetUsersQueryDto) {
    const {
      keyword,
      gender,
      page = this.defaultQueryPage,
      limit = this.defaultQueryLimit,
      sortBy = this.defaultSortField,
      sortDirection = this.defaultSortDirection,
    } = query;
    this.validateSortByField(sortBy);
    const skip = (page - 1) * limit;
    let filter: RootFilterQuery<User> = {};
    if (gender) {
      filter = {
        gender,
      };
    }
    const keywordFilter = getKeywordFilter<UserWithTimestamps>(
      keyword,
      this.keywordFilterFields,
    );
    filter = {
      ...filter,
      ...keywordFilter,
    };
    return this.userModel
      .find(filter, USERS_LIST_PROJECTION, {
        skip,
        limit,
      })
      .sort({
        [sortBy]: sortDirection,
      });
  }

  getUserById(id: string) {
    return this.userModel
      .findById(id, USER_DETAILS_PROJECTION)
      .populate('settings', USER_SETTINGS_PROJECTION)
      .populate('posts', USER_POSTS_PROJECTION);
  }

  async findByUsername(username: string) {
    return this.userModel
      .findOne({
        $or: [
          {
            username,
          },
          {
            email: username,
          },
        ],
      })
      .lean();
  }

  async getUserProfile(id: string) {
    const userData = await this.userModel
      .findById(id, USER_PROFILE_PROJECTION)
      .populate('settings', USER_SETTINGS_PROJECTION)
      .lean();
    return this.serializeUserProfile(userData);
  }

  private async isUsernameUnique(
    username: string,
    userId?: string,
    opts: ThrowableOptions = { shouldThrow: true },
  ): Promise<boolean> {
    const user = await this.userModel.findOne({
      username,
      ...(userId && { _id: { $ne: userId } }),
    });
    const result = !user;
    if (!result && opts.shouldThrow) {
      throw new BadRequestException({
        message: 'Username already in use',
      });
    }
    return result;
  }

  private async isEmailUnique(
    email: string,
    userId?: string,
    opts: ThrowableOptions = { shouldThrow: true },
  ): Promise<boolean> {
    const user = await this.userModel.findOne({
      email,
      ...(userId && { _id: { $ne: userId } }),
    });
    const result = !user;
    if (!result && opts.shouldThrow) {
      throw new BadRequestException({
        message: 'Email already in use',
      });
    }
    return result;
  }

  async checkWhetherUsernameAndEmailAreUnique(username: string, email: string) {
    return Promise.all([
      this.isUsernameUnique(username),
      this.isEmailUnique(email),
    ]);
  }

  async register({ settings: settingsData, ...userData }: RegisterUserDto) {
    const { username, email } = userData;
    await this.checkWhetherUsernameAndEmailAreUnique(username, email);
    const session = await this.connection.startSession();
    session.startTransaction();
    let newSettingsId: mongoose.Types.ObjectId = null;
    try {
      if (settingsData) {
        const settingsInstance = new this.userSettingsModel(settingsData);
        const newSettings = await settingsInstance.save({ session });
        newSettingsId = newSettings._id;
      }
      const { password } = userData;
      const userInstance = new this.userModel({
        ...userData,
        password: hashPassword(password),
        ...(newSettingsId && {
          settings: newSettingsId,
        }),
      });
      const savedUser = await userInstance.save({ session });
      const userWithSettings = await savedUser.populate(
        'settings',
        USER_SETTINGS_PROJECTION,
      );
      await session.commitTransaction();
      return this.serializeUserProfile(userWithSettings);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async validateUserLoginDetails(username: string, inputPassword: string) {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      });
    }
    const { password: originalPassword } = user;
    if (!isPasswordMatch(inputPassword, originalPassword)) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      });
    }
    return user;
  }

  async update(
    id: string,
    { settings: settingsData, ...userData }: UpdateUserDto,
  ) {
    const user = await this.userModel.findById(id);
    if (!user)
      throw new NotFoundException({
        message: 'There are no users with the provided ID',
      });
    let newUserSettingsId: mongoose.Types.ObjectId = null;
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      if (settingsData) {
        if (user.settings) {
          await this.userSettingsModel
            .findByIdAndUpdate(user.settings, settingsData, {
              new: true,
            })
            .session(session);
        } else {
          const settingsInstance = new this.userSettingsModel(settingsData);
          const newSettings = await settingsInstance.save({ session });
          newUserSettingsId = newSettings._id;
        }
      }
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          id,
          {
            ...userData,
            ...(newUserSettingsId && {
              settings: newUserSettingsId,
            }),
          },
          {
            new: true,
            projection: UPDATED_USER_PROJECTION,
          },
        )
        .session(session);
      const updatedUserWithSettings = await updatedUser.populate(
        'settings',
        USER_SETTINGS_PROJECTION,
      );
      await session.commitTransaction();
      return updatedUserWithSettings;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async delete(id: string) {
    const user = await this.userModel.findById(id);
    if (!user)
      throw new NotFoundException({
        message: 'There are no users with the provided ID',
      });
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.userModel
        .deleteOne({
          _id: id,
        })
        .session(session);
      if (user.settings) {
        await this.userSettingsModel
          .deleteOne({
            _id: user.settings,
          })
          .session(session);
      }
      if (user.posts?.length) {
        await this.postModel
          .deleteMany({
            _id: {
              $in: user.posts,
            },
          })
          .session(session);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
