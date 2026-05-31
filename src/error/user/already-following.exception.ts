export class AlreadyFollowingException extends Error {
  constructor(followerId: number, followingId: number) {
    super(
      `User with id ${followerId} already follows user with id ${followingId}`,
    );
  }
}
