import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenVerifier } from '../repository/i-token-verifier';
import { ITokenIssuer } from '../repository/i-token-issuer';
import { InvalidTokenException } from '../error/auth/invalid-token.exception';
import { JwtModel, UserModel } from '../model';

@Injectable()
export class JwtTokenRepository implements ITokenVerifier, ITokenIssuer {
  constructor(private readonly jwt: JwtService) {}

  async issue(user: UserModel): Promise<JwtModel> {
    const accessToken = await this.jwt.signAsync({ sub: user.id });
    return { accessToken };
  }

  async verify(token: string): Promise<Pick<UserModel, 'id'>> {
    let payload: Record<string, unknown>;
    try {
      payload = await this.jwt.verifyAsync(token, { algorithms: ['HS256'] });
    } catch {
      throw new InvalidTokenException();
    }

    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id <= 0) {
      throw new InvalidTokenException();
    }

    return { id };
  }
}
