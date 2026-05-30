export class AlreadyLikedException extends Error {
  constructor(commentId: number, userId: number) {
    super(
      `User with id ${userId} has already liked comment with id ${commentId}`,
    );
  }
}
