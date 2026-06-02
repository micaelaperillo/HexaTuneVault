import { TypeORMError } from 'typeorm';
import type { ErrorRule } from 'error-mapper-decorator';
import { UserDBException } from '../error/user/user-db.exception';

// Anti-corruption rule for user persistence: any TypeORM failure becomes a
// domain-level UserDBException so infrastructure errors never cross the
// boundary.
export const userPersistenceFailure: ErrorRule<TypeORMError> = {
  from: TypeORMError,
  to: (error) => new UserDBException(error.message),
};
