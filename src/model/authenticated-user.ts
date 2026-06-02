import type { UserModel } from './user.model';

export type AuthenticatedUser = Pick<UserModel, 'id'>;
