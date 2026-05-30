import { UserModel } from '../../model/user.model';

export const EDIT_USER = Symbol('IEditUser');

export interface IEditUser {
  edit(user: Partial<UserModel>): Promise<UserModel>;
}
