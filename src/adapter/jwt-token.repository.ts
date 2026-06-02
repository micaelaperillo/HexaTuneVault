import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MapErrors } from 'error-mapper-decorator';
import { ITokenVerifier } from '../repository/token-verifier.port';
import { ITokenIssuer } from '../repository/token-issuer.port';
import { InvalidTokenException } from '../error/auth/invalid-token.exception';
import { JwtModel, UserModel } from '../model';

type Claims = { sub: UserModel['id'] };

@Injectable()
export class JwtTokenRepository implements ITokenVerifier, ITokenIssuer {
  constructor(private readonly jwt: JwtService) {}

  async issue(user: UserModel): Promise<JwtModel> {
    const claims: Claims = { sub: user.id };
    const accessToken = await this.jwt.signAsync(claims);
    return { accessToken };
  }

  @MapErrors({ from: Error, to: () => new InvalidTokenException() })
  async verify(token: string): Promise<Pick<UserModel, 'id'>> {
    const payload = await this.jwt.verifyAsync<Claims>(token, {
      algorithms: ['HS256'],
    });

    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id <= 0) {
      throw new InvalidTokenException();
    }

    return { id };
  }
}
