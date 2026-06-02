import { ILike, type FindOperator } from 'typeorm';

// Escapes LIKE/ILIKE wildcards (% _ \) so user-supplied search terms match
// literally instead of acting as pattern metacharacters.
export function escapeLike(term: string): string {
  return term.replace(/[%_\\]/g, '\\$&');
}

// Builds a case-insensitive "contains" condition for an optional filter value.
// Returns undefined when the value is absent so TypeORM omits the column from
// the generated WHERE clause.
export function containsInsensitive(
  value: string | undefined,
): FindOperator<string> | undefined {
  return value === undefined ? undefined : ILike(`%${escapeLike(value)}%`);
}
