import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRefreshToken } from 'src/schemas/refresh-token-schemas/user.refresh-token.schema';
import { UserRefreshTokenPayload } from '../types/refresh-token-payload.type';
import { AbstractRefreshTokensService } from './abstract.refresh-tokens.service';

@Injectable()
export class UserRefreshTokensService extends AbstractRefreshTokensService<UserRefreshToken> {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(UserRefreshToken.name)
    protected readonly model: Model<UserRefreshToken>,
  ) {
    super(model);
  }

  async generateRefreshToken(
    payload: UserRefreshTokenPayload,
  ): Promise<string> {
    const newRefreshTokenDocument = await new this.model(payload).save();
    return this.jwtService.sign({
      sub: newRefreshTokenDocument._id,
      userId: payload.user,
    });
  }
}
