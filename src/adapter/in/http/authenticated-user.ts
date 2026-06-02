import type { UserModel } from '../../../model/user.model';

export type AuthenticatedUser = Pick<UserModel, 'id'>;
