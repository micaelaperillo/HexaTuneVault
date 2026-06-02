import { TypeORMError } from 'typeorm';
import type { ErrorRule } from 'error-mapper-decorator';
import { CommentDBException } from '../error/comment/comment-db.exception';

// Anti-corruption rule for comment persistence: any TypeORM failure becomes a
// domain-level CommentDBException so infrastructure errors never cross the
// boundary.
export const commentPersistenceFailure: ErrorRule<TypeORMError> = {
  from: TypeORMError,
  to: (error) => new CommentDBException(error.message),
};
