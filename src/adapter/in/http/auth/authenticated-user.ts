import type { UserModel } from '../../../../model/user';

export type AuthenticatedUser = Pick<UserModel, 'id'>;
