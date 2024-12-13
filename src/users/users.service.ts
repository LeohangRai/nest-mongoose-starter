import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Connection, Model } from 'mongoose';
import { UserSettings } from 'src/schemas/user-settings.schema';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  get() {
    return this.userModel.find().populate('settings');
  }

  getUserById(id: string) {
    return this.userModel.findById(id).populate('settings');
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
      const userWithSettings = await savedUser.populate('settings');
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
          },
        )
        .session(session);
      const updatedUserWithSettings = await updatedUser.populate('settings');
      await session.commitTransaction();
      await session.endSession();
      return updatedUserWithSettings;
    } catch (error) {
      await session.abortTransaction();
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
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
