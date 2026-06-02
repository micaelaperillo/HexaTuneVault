import { UserModel } from '../../../model/user';
import { AuthToken } from '../../../model';

export const AUTHENTICATE_USER = Symbol('IAuthenticateUser');

export interface IAuthenticateUser {
  authenticate(
    credentials: Pick<UserModel, 'username' | 'password'>,
  ): Promise<AuthToken>;
}
