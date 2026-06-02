import { Page, PageRequest, UserModel } from '../../model';

export const LIST_FOLLOWS = Symbol('IListFollows');

export interface IListFollows {
  findFollowers(userId: number, page: PageRequest): Promise<Page<UserModel>>;
  findFollowing(userId: number, page: PageRequest): Promise<Page<UserModel>>;
}
