import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MapErrors } from 'error-mapper-decorator';
import { ITokenVerifier, ITokenIssuer } from '../../../port/out';
import { InvalidTokenException } from '../../../error/auth/invalid-token.exception';
import { AuthToken, UserModel } from '../../../model';

type Claims = { sub: UserModel['id'] };

@Injectable()
export class JwtTokenRepository implements ITokenVerifier, ITokenIssuer {
  constructor(private readonly jwt: JwtService) {}

  async issue(user: UserModel): Promise<AuthToken> {
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
