import { TypeORMError } from 'typeorm';
import type { ErrorRule } from 'error-mapper-decorator';
import { ReviewRepositoryException } from '../error/review/review-repository.exception';

// Catch-all anti-corruption rule shared by every review persistence adapter:
// any TypeORM failure becomes a domain-level repository exception so
// infrastructure never crosses the boundary. Order it AFTER more specific
// QueryFailedError rules at each call site.
export const reviewPersistenceFailure: ErrorRule<TypeORMError> = {
  from: TypeORMError,
  to: (error) => new ReviewRepositoryException(error.message),
};
