import type { AuthenticatedUser } from '../model/authenticated-user';

export const TOKEN_VERIFIER = Symbol('ITokenVerifier');

export interface ITokenVerifier {
  verify(token: string): Promise<AuthenticatedUser>;
}
