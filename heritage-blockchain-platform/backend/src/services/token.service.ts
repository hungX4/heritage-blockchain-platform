import crypto from 'crypto';
import jwt, { type JwtPayload as DecodedJwtPayload, type SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../config/database.js';
import { buildExpiry } from '../common/utils/time.util.js';
import { RefreshToken } from '../models/refresh-token.model.js';
import { User } from '../models/user.model.js';
import { AuthResponseDto } from '../types/dto/auth.dto.js';
import { JwtPayload } from '../types/interface/jwt-payload.interface.js';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET_IS_REQUIRED');
  }

  return 'development-only-jwt-secret-change-me';
};

const getAccessTokenTtl = () => process.env.JWT_ACCESS_EXPIRED || '15m';
const getRefreshTokenTtl = () => process.env.JWT_REFRESH_EXPIRED || '30d';

export class TokenServices {
  private static get repo() {
    return AppDataSource.getRepository(RefreshToken);
  }

  static async issueTokens(user: User, deviceId = 'default'): Promise<AuthResponseDto & { refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.role,
      jti: crypto.randomUUID()
    };

    const accessToken = jwt.sign(payload, getJwtSecret(), {
      expiresIn: getAccessTokenTtl()
    } as SignOptions);

    const rawToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = buildExpiry(getRefreshTokenTtl());

    const refreshToken = this.repo.create({
      token: rawToken,
      userId: user.id,
      deviceId,
      expiresAt,
      isRevoked: false,
      replacedBy: null
    });

    await this.repo.save(refreshToken);

    const decoded = jwt.decode(accessToken) as DecodedJwtPayload | null;
    const expiredIn = decoded?.exp && decoded?.iat ? decoded.exp - decoded.iat : 0;

    return {
      accessToken,
      expiredIn,
      userData: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId ?? undefined
      },
      refreshToken: rawToken
    };
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  }

  static async rotateTokens(
    userId: string,
    deviceId = 'default',
    oldToken: string
  ): Promise<AuthResponseDto & { refreshToken: string }> {
    const repo = this.repo;

    const stored = await repo.findOne({
      where: { token: oldToken },
      relations: ['user']
    });

    if (!stored) {
      await this.revokeAllUserToken(userId);
      throw new Error('YOUR_REFRESH_TOKEN_INVALID');
    }

    if (stored.isRevoked) {
      await this.revokeAllUserToken(userId);
      throw new Error('REFRESH_TOKEN_REUSE_DETECTED');
    }

    if (stored.expiresAt < new Date()) {
      await this.repo.delete({ id: stored.id });
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    stored.isRevoked = true;
    await repo.save(stored);

    const newToken = await this.issueTokens(stored.user, deviceId);

    stored.replacedBy = newToken.refreshToken;
    await repo.save(stored);

    return newToken;
  }

  static async revokeToken(userId: string, deviceId = 'default') {
    await this.repo.update(
      { userId, deviceId, isRevoked: false },
      { isRevoked: true }
    );
  }

  static async revokeAllUserToken(userId: string) {
    await this.repo.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }
}
