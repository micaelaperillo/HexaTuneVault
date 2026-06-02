// Escapes LIKE/ILIKE wildcards (% _ \) so user-supplied search terms match
// literally instead of acting as pattern metacharacters.
export function escapeLike(term: string): string {
  return term.replace(/[%_\\]/g, '\\$&');
}
