import { UserModel, UserFilters } from '../../../model/user';
import type { Page } from '../../../model';

export const SEARCH_USER = Symbol('ISearchUser');

export interface ISearchUser {
  search(filters: UserFilters): Promise<Page<UserModel>>;
}
