import { UserModel } from '../../model/user.model';

export const CREATE_USER = Symbol('ICreateUser');

export interface ICreateUser {
  create(user: Omit<UserModel, 'id'>): Promise<UserModel>;
}
