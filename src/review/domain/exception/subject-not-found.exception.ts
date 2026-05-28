import { DomainException } from '@domain/exception/domain.exception.js';

export class SubjectNotFoundException extends DomainException {
  constructor() {
    super('Subject not found', 'SUBJECT_NOT_FOUND');
  }
}
