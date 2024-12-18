import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { Model } from 'mongoose';
import { AdminProfileSerializer } from 'src/auth/serializers/admin-profile.serializer';
import { isPasswordMatch } from 'src/common/helpers/crypto/bcrypt.helper';
import { Admin } from 'src/schemas/admin.schema';
import { ADMIN_PROFILE_PROJECTION } from './projections/admin-profile.projection';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
  ) {}

  private serializeProfile(admin: Partial<Admin>) {
    return plainToClass(AdminProfileSerializer, admin, {
      excludeExtraneousValues: true,
    });
  }

  async getProfile(id: string) {
    const adminData = await this.adminModel
      .findById(id, ADMIN_PROFILE_PROJECTION)
      .lean();
    return this.serializeProfile(adminData);
  }

  async findByUsername(username: string) {
    return this.adminModel
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

  async validateLoginDetails(username: string, inputPassword: string) {
    const admin = await this.findByUsername(username);
    if (!admin) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      });
    }
    const { password: originalPassword } = admin;
    if (!isPasswordMatch(inputPassword, originalPassword)) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      });
    }
    return admin;
  }
}
