import { UserModel } from '../../model/user.model';
import { JwtModel } from '../../model/jwt.model';

export const AUTHENTICATE_USER = Symbol('IAuthenticateUser');

export interface IAuthenticateUser {
  authenticate(
    credentials: Pick<UserModel, 'username' | 'password'>,
  ): Promise<JwtModel>;
}
