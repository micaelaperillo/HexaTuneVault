import { ILike, type FindOperator } from 'typeorm';

export function escapeLike(term: string): string {
  return term.replace(/[%_\\]/g, '\\$&');
}

export function containsInsensitive(value: string): FindOperator<string> {
  return ILike(`%${escapeLike(value)}%`);
}
