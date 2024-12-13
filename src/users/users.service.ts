import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Connection, Model } from 'mongoose';
import { UserSettings } from 'src/schemas/user-settings.schema';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UPDATED_USER_PROJECTION } from './projections/updated-user.projection';
import { USER_DETAILS_PROJECTION } from './projections/user-details.projection';
import { USER_POSTS_PROJECTION } from './projections/user-posts.projection';
import { USER_SETTINGS_PROJECTION } from './projections/user-settings.projection';
import { USERS_LIST_PROJECTION } from './projections/users-list.projection';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  get() {
    return this.userModel.find({}, USERS_LIST_PROJECTION);
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
      await session.endSession();
      return userWithSettings;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
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
      await session.endSession();
      return updatedUserWithSettings;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }

  // TODO: delete all the associated posts as well
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
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
