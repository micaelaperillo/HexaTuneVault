import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenVerifier } from '../repository/i-token-verifier';
import type { AuthenticatedUser } from '../model/authenticated-user';
import { InvalidTokenException } from '../error/auth/invalid-token.exception';

@Injectable()
export class JwtTokenVerifier implements ITokenVerifier {
  constructor(private readonly jwt: JwtService) {}

  async verify(token: string): Promise<AuthenticatedUser> {
    let payload: Record<string, unknown>;
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new InvalidTokenException();
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || typeof payload.username !== 'string') {
      throw new InvalidTokenException();
    }

    return { userId, username: payload.username };
  }
}
