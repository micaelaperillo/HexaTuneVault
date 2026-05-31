export const DELETE_USER = Symbol('IDeleteUser');

export interface IDeleteUser {
  deleteById(userId: number): Promise<void>;
}
