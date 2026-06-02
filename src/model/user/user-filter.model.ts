import type { PageableFilters } from '../page.model';

export type UserFilters = PageableFilters & {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};
