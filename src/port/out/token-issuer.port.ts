import type { UserModel } from '../../model/user';
import type { AuthToken } from '../../model';

export const TOKEN_ISSUER = Symbol('ITokenIssuer');

export interface ITokenIssuer {
  issue(user: UserModel): Promise<AuthToken>;
}
