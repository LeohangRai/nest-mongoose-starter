import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminRefreshToken } from 'src/schemas/refresh-token-schemas/admin.refresh-token.schema';
import { AdminRefreshTokenPayload } from '../types/refresh-token-payload.type';
import { AbstractRefreshTokensService } from './abstract.refresh-tokens.service';

@Injectable()
export class AdminRefreshTokensService extends AbstractRefreshTokensService<AdminRefreshToken> {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(AdminRefreshToken.name)
    protected readonly model: Model<AdminRefreshToken>,
  ) {
    super(model);
  }

  async generateRefreshToken(
    payload: AdminRefreshTokenPayload,
  ): Promise<string> {
    const newRefreshTokenDocument = await new this.model(payload).save();
    return this.jwtService.sign({
      sub: newRefreshTokenDocument._id,
      adminId: payload.admin,
    });
  }
}
