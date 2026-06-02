import type { PageableFilters } from './page.model';

export interface UserFilters extends PageableFilters {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}
