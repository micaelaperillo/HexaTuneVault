import { DomainException } from '../domain.exception';

export class CommentDeletionForbiddenException extends DomainException {
  constructor() {
    super('Not authorized to delete this comment', 'FORBIDDEN_DELETION');
  }
}
