export class AlreadyLikedException extends Error {
  constructor(commentId: number, userId: string) {
    super(
      `User with id ${userId} has already liked comment with id ${commentId}`,
    );
  }
}
