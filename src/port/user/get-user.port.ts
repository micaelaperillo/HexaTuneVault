import { UserModel } from '../../model/user.model';

export const GET_USER = Symbol('IGetUser');

export interface IGetUser {
  get(userId: number): Promise<UserModel>;
}
