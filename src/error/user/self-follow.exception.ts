export class SelfFollowException extends Error {
  constructor(userId: number) {
    super(`User with id ${userId} cannot follow themselves`);
  }
}
