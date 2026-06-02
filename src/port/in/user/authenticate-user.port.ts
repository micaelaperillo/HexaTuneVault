import { UserModel } from '../../../model/user.model';
import { AuthToken } from '../../../model/auth-token.model';

export const AUTHENTICATE_USER = Symbol('IAuthenticateUser');

export interface IAuthenticateUser {
  authenticate(
    credentials: Pick<UserModel, 'username' | 'password'>,
  ): Promise<AuthToken>;
}
