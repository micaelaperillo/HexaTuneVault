import type { UserModel } from '../model';
import type { UserFilters } from '../model/user.filter';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
  create(user: Omit<UserModel, 'id'>): Promise<UserModel>;
  findById(id: number): Promise<UserModel | null>;
  findByUsername(username: string): Promise<UserModel | null>;
  authenticate(username: string, plaintext: string): Promise<UserModel | null>;
  search(filters: UserFilters): Promise<UserModel[]>;
  update(user: Partial<UserModel>): Promise<UserModel>;
  deleteById(id: number): Promise<void>;
  follow(followerId: number, followingId: number): Promise<void>;
  unfollow(followerId: number, followingId: number): Promise<void>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
}
