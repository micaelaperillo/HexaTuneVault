export class NotLikedException extends Error {
  constructor(commentId: number, userId: string) {
    super(`User with id ${userId} has not liked comment with id ${commentId}`);
  }
}
