import { DomainException } from './domain.exception.js';

export class SubjectNotFoundException extends DomainException {
  constructor() {
    super('Subject not found', 'SUBJECT_NOT_FOUND');
  }
}
