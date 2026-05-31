import { UserModel } from '../../model/user.model';
import { UserFilters } from '../../model/user.filter';

export const SEARCH_USER = Symbol('ISearchUser');

export interface ISearchUser {
  search(filters: UserFilters): Promise<UserModel[]>;
}
