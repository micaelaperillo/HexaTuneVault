import { DomainException } from '../domain.exception';

export class SelfFollowException extends DomainException {
  constructor(userId: number) {
    super(
      `User with id ${userId} cannot follow themselves`,
      'UNPROCESSABLE_ENTITY',
    );
  }
}
