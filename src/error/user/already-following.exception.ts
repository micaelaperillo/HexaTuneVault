import { DomainException } from '../domain.exception';

export class AlreadyFollowingException extends DomainException {
  constructor(followerId: number, followingId: number) {
    super(
      `User with id ${followerId} already follows user with id ${followingId}`,
      'CONFLICT',
    );
  }
}
