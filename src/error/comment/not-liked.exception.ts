export class NotLikedException extends Error {
  constructor(commentId: number, userId: number) {
    super(`User with id ${userId} has not liked comment with id ${commentId}`);
  }
}
