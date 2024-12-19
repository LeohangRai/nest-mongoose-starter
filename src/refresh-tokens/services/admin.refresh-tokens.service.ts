import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AdminsService } from 'src/admins/admins.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AdminRefreshToken } from 'src/schemas/refresh-token-schemas/admin.refresh-token.schema';
import { AbstractRefreshTokensService } from './abstract.refresh-tokens.service';

@Injectable()
export class AdminRefreshTokensService extends AbstractRefreshTokensService<AdminRefreshToken> {
  constructor(
    protected readonly jwtService: JwtService,
    @InjectModel(AdminRefreshToken.name)
    protected readonly model: Model<AdminRefreshToken>,
    @InjectConnection() protected readonly connection: Connection,
    private readonly adminService: AdminsService,
  ) {
    super(UserRole.ADMIN, jwtService, model, connection);
  }

  protected validateRefreshTokenUser(userId: string): Promise<boolean> {
    return this.adminService.validateAdminId(userId);
  }
}
