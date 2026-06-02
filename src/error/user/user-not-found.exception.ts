import { DomainException } from '../domain.exception';

export class UserNotFoundException extends DomainException {
  constructor(id: number) {
    super(`User with id ${id} not found`, 'NOT_FOUND');
  }
}
