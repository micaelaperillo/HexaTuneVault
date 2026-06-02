import { DomainException } from '../domain.exception';

export class NotFollowingException extends DomainException {
  constructor(followerId: number, followingId: number) {
    super(
      `User with id ${followerId} does not follow user with id ${followingId}`,
      'CONFLICT',
    );
  }
}
