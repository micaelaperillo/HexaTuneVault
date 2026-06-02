import type { UserModel } from '../../model/user.model';
import type { AuthToken } from '../../model/auth-token.model';

export const TOKEN_ISSUER = Symbol('ITokenIssuer');

export interface ITokenIssuer {
  issue(user: UserModel): Promise<AuthToken>;
}
