import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenVerifier } from '../repository/i-token-verifier';
import type { AuthenticatedUser } from '../model/authenticated-user';
import { InvalidTokenException } from '../error/auth/invalid-token.exception';

interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class JwtTokenVerifier implements ITokenVerifier {
  constructor(private readonly jwt: JwtService) {}

  async verify(token: string): Promise<AuthenticatedUser> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      return { userId: payload.sub, username: payload.username };
    } catch {
      throw new InvalidTokenException();
    }
  }
}
