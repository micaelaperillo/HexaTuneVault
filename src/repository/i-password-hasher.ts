export const PASSWORD_HASHER = Symbol('IPasswordHasher');

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
