import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
  ) {}

  get() {
    return this.userModel.find().populate('settings');
  }

  getUserById(id: string) {
    return this.userModel.findById(id).populate('settings');
  }

  async create({ settings: settingsData, ...userData }: CreateUserDto) {
    if (settingsData) {
      const settingsInstance = new this.userSettingsModel(settingsData);
      const newSettings = await settingsInstance.save();
      const newUser = new this.userModel({
        ...userData,
        settings: newSettings._id,
      });
      return newUser.save();
    }
    const newUser = new this.userModel(userData);
    return (await newUser.save()).populate('settings');
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
    let userSettingsId = user.settings;
    if (settingsData) {
      if (user.settings) {
        await this.userSettingsModel.findByIdAndUpdate(
          user.settings,
          settingsData,
          {
            new: true,
          },
        );
      } else {
        const newSetting = await this.userSettingsModel.create(settingsData);
        userSettingsId = newSetting.id;
      }
    }
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...userData,
          settings: userSettingsId,
        },
        {
          new: true,
        },
      )
      .populate('settings');
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id, {
      new: true,
    });
  }
}
