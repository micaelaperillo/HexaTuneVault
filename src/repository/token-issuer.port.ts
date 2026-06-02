import type { UserModel } from '../model/user.model';
import type { JwtModel } from '../model/jwt.model';

export const TOKEN_ISSUER = Symbol('ITokenIssuer');

export interface ITokenIssuer {
  issue(user: UserModel): Promise<JwtModel>;
}
