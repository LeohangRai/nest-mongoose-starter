import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Connection, Model, RootFilterQuery } from 'mongoose';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_PAGE,
} from 'src/common/dtos/query.dto';
import { SortDirection } from 'src/common/enums/sort-direction.enum';
import { ValidationErrorMessage } from 'src/common/types/validation-error-message.type';
import { Post } from 'src/schemas/post.schema';
import { UserSettings } from 'src/schemas/user-settings.schema';
import { User, UserModelSortFields } from 'src/schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersQueryDto } from './dtos/get-users.query.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UPDATED_USER_PROJECTION } from './projections/updated-user.projection';
import { USER_DETAILS_PROJECTION } from './projections/user-details.projection';
import { USER_POSTS_PROJECTION } from './projections/user-posts.projection';
import { USER_SETTINGS_PROJECTION } from './projections/user-settings.projection';
import { USERS_LIST_PROJECTION } from './projections/users-list.projection';

@Injectable()
export class UsersService {
  private defaultQueryPage = DEFAULT_QUERY_PAGE;
  private defaultQueryLimit = DEFAULT_QUERY_LIMIT;
  private sortableFields: UserModelSortFields[] = [
    'createdAt',
    'updatedAt',
    'username',
    'email',
    'gender',
  ];
  private defaultSortField: UserModelSortFields = 'createdAt';
  private defaultSortDirection = SortDirection.DESCENDING;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
    @InjectModel(Post.name)
    private postModel: Model<Post>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  validateSortByField(sortBy: string) {
    if (!sortBy) return;
    if (!this.sortableFields.includes(sortBy as UserModelSortFields)) {
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
    if (keyword) {
      filter = {
        ...filter,
        $or: [
          {
            username: {
              $regex: keyword,
              $options: 'i',
            },
          },
          {
            email: {
              $regex: keyword,
              $options: 'i',
            },
          },
        ],
      };
    }
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

  async create({ settings: settingsData, ...userData }: CreateUserDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    let newSettingsId: mongoose.Types.ObjectId = null;
    try {
      if (settingsData) {
        const settingsInstance = new this.userSettingsModel(settingsData);
        const newSettings = await settingsInstance.save({ session });
        newSettingsId = newSettings._id;
      }
      const userInstance = new this.userModel({
        ...userData,
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
      return userWithSettings;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
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
