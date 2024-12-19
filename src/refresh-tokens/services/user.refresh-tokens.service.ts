import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserRefreshToken } from 'src/schemas/refresh-token-schemas/user.refresh-token.schema';
import { UsersService } from 'src/users/users.service';
import { AbstractRefreshTokensService } from './abstract.refresh-tokens.service';

@Injectable()
export class UserRefreshTokensService extends AbstractRefreshTokensService<UserRefreshToken> {
  constructor(
    protected readonly jwtService: JwtService,
    @InjectModel(UserRefreshToken.name)
    protected readonly model: Model<UserRefreshToken>,
    @InjectConnection() protected readonly connection: Connection,
    private readonly userService: UsersService,
  ) {
    super(UserRole.USER, jwtService, model, connection);
  }

  protected validateRefreshTokenUser(userId: string): Promise<boolean> {
    return this.userService.validateUserId(userId);
  }
}
