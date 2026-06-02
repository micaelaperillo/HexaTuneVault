import { Transform } from 'class-transformer';

// Trims a string value, leaving non-string values untouched so validation
// decorators report the real type error instead of a cast failure.
export const TrimString = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

// Trims each string element of an array value, leaving non-array values and
// non-string elements untouched.
export const TrimStringArray = () =>
  Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((item: unknown) =>
          typeof item === 'string' ? item.trim() : item,
        )
      : value,
  );

// Coerces a value to a number (so query-string params validate as numeric).
export const ToNumber = () =>
  Transform(({ value }: { value: unknown }) => Number(value));

// Wraps a single value in an array, leaving arrays untouched (so a single
// query-string param validates the same as a repeated one).
export const ToArray = () =>
  Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? (value as unknown[]) : [value],
  );
