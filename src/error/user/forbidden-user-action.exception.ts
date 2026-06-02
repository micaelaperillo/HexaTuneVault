import { DomainException } from '../domain.exception';

export class ForbiddenUserActionException extends DomainException {
  constructor() {
    super('Not authorized to modify this user', 'FORBIDDEN_ACTION');
  }
}
