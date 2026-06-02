export const FOLLOW_USER = Symbol('IFollowUser');

export interface IFollowUser {
  follow(followerId: number, followingId: number): Promise<void>;
  unfollow(followerId: number, followingId: number): Promise<void>;
}
