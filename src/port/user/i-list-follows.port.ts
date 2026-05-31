import type { Page, PageRequest } from '../../model/page.model';

export const LIST_FOLLOWS = Symbol('IListFollows');

export interface IListFollows {
  findFollowers(userId: number, page: PageRequest): Promise<Page<number>>;
  findFollowing(userId: number, page: PageRequest): Promise<Page<number>>;
}
