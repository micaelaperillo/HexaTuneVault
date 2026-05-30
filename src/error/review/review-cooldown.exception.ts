import { DomainException } from '@error/domain.exception.js';

export class ReviewCooldownException extends DomainException {
  constructor() {
    super('Please wait before reviewing this subject again', 'REVIEW_COOLDOWN');
  }
}
