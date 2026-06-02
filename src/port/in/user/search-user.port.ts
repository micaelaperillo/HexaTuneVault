import { UserModel } from '../../../model/user.model';
import { UserFilters } from '../../../model/user-filter.model';
import type { Page } from '../../../model/page.model';

export const SEARCH_USER = Symbol('ISearchUser');

export interface ISearchUser {
  search(filters: UserFilters): Promise<Page<UserModel>>;
}
