import { Model } from 'mongoose';
import { AdminRefreshToken } from 'src/schemas/refresh-token-schemas/admin.refresh-token.schema';
import { UserRefreshToken } from 'src/schemas/refresh-token-schemas/user.refresh-token.schema';
import { BaseRefreshTokenPayload } from '../types/refresh-token-payload.type';

export abstract class AbstractRefreshTokensService<
  T extends UserRefreshToken | AdminRefreshToken,
> {
  constructor(protected readonly model: Model<T>) {}

  abstract generateRefreshToken(
    payload: BaseRefreshTokenPayload,
  ): Promise<string>;

  async isRefreshTokenValid(id: string): Promise<boolean> {
    const refreshToken = await this.model.findById(id);
    return (
      refreshToken &&
      !refreshToken.isRevoked &&
      new Date() < refreshToken.expiresAt
    );
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { isRevoked: true });
  }
}
