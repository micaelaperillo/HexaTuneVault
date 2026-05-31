export class NotFollowingException extends Error {
  constructor(followerId: number, followingId: number) {
    super(
      `User with id ${followerId} does not follow user with id ${followingId}`,
    );
  }
}
