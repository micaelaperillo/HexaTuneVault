import { UserModel } from '../model';

export const TOKEN_VERIFIER = Symbol('ITokenVerifier');

export interface ITokenVerifier {
  verify(token: string): Promise<Pick<UserModel, 'id'>>;
}
