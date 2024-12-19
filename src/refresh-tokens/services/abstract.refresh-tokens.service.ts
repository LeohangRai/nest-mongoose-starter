import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientSession, Connection, Model, QueryOptions } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';
import { SignRefreshJWTInput } from 'src/common/types/sign-jwt.input.type';
import { AdminRefreshToken } from 'src/schemas/refresh-token-schemas/admin.refresh-token.schema';
import { UserRefreshToken } from 'src/schemas/refresh-token-schemas/user.refresh-token.schema';
import { RefreshTokenPayload } from '../types/refresh-token-payload.type';

export abstract class AbstractRefreshTokensService<
  T extends UserRefreshToken | AdminRefreshToken,
> {
  constructor(
    protected readonly role: UserRole,
    protected readonly jwtService: JwtService,
    protected readonly model: Model<T>,
    protected readonly connection: Connection,
  ) {}

  /**
   * validate whether the user/admin associated with the refresh token is valid or not
   * @param userId ID of the user/admin
   * @returns boolean
   * @throws UnauthorizedException if the user/admin is not found or is not active
   */
  protected abstract validateRefreshTokenUser(userId: string): Promise<boolean>;

  /**
   * validate whether the refresh token is valid or not
   * - usable inside the jwt-refresh.strategy validate() method
   * @param refreshTokenId ID of the refresh token document
   * @param userId ID of the user/admin
   *
   * @throws UnauthorizedException if the refresh token is invalid, revoked or expired
   * @throws UnauthorizedException if the user/admin is not found or is not active
   * @returns boolean
   */
  async validateRefreshToken(
    refreshTokenId: string,
    userId: string,
  ): Promise<boolean> {
    await this.validateRefreshTokenUser(userId);
    const refreshToken = await this.model.findById(refreshTokenId);
    const isRefreshTokenValid =
      refreshToken &&
      !refreshToken.isRevoked &&
      new Date() < refreshToken.expiresAt;
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid refresh token',
      });
    }
    return true;
  }

  async revokeRefreshToken(id: string, session?: ClientSession): Promise<void> {
    const queryOpts: QueryOptions = session ? { session } : {};
    await this.model.findByIdAndUpdate(id, { isRevoked: true }, queryOpts);
  }

  async generateRefreshToken(
    payload: RefreshTokenPayload,
    session?: ClientSession,
  ): Promise<string> {
    const queryOpts: QueryOptions = session ? { session } : {};
    const newRefreshTokenDocument = await new this.model(payload).save(
      queryOpts,
    );
    const refreshTokenInput: SignRefreshJWTInput = {
      sub: newRefreshTokenDocument._id as string,
      userId: payload.user,
      role: this.role,
    };
    return this.jwtService.sign(refreshTokenInput);
  }

  /**
   * generate new refresh token by using current refresh token
   * - revokes the old refresh token
   * - generates a new refresh token and returns it
   * @param oldRefreshTokenId string
   * @param payload UserRefreshTokenPayload
   * @returns string
   */
  async regenerateRefreshToken(
    oldRefreshTokenId: string,
    payload: RefreshTokenPayload,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newRefreshToken = await this.generateRefreshToken(payload, session);
      await this.revokeRefreshToken(oldRefreshTokenId, session);
      await session.commitTransaction();
      return newRefreshToken;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
