import { DomainException } from '../domain.exception';

export class ReviewCooldownException extends DomainException {
  constructor() {
    super('Please wait before reviewing this subject again', 'REVIEW_COOLDOWN');
  }
}
