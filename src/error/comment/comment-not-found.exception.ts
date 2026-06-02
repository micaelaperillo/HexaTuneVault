import { DomainException } from '../domain.exception';

export class CommentNotFoundException extends DomainException {
  constructor(id: number) {
    super(`Comment with id ${id} not found`, 'NOT_FOUND');
  }
}
