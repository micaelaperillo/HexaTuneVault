// Returns a shallow copy of `obj` with every key whose value is `undefined`
// removed, so partial-update payloads never overwrite stored fields with
// `undefined`.
export function pruneUndefined<T extends object>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (value !== undefined) result[key] = value;
  }
  return result;
}
