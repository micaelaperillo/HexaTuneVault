import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenIssuer } from '../repository/i-token-issuer';
import { UserModel } from '../model/user.model';
import { JwtModel } from '../model/jwt.model';

@Injectable()
export class JwtTokenIssuer implements ITokenIssuer {
  constructor(private readonly jwt: JwtService) {}

  async issue(user: UserModel): Promise<JwtModel> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      username: user.username,
    });
    return { accessToken };
  }
}
