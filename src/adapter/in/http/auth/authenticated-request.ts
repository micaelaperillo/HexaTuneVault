import type { Request } from 'express';
import type { AuthenticatedUser } from '../../../../model/user';

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };
