type ErrorClass<E extends Error> = new (...args: never[]) => E;

export interface ErrorRule<E extends Error = Error> {
  readonly from: ErrorClass<E>;
  readonly when?: (error: E) => boolean;
  readonly to: (error: E) => Error;
}

type AsyncMethod = (this: unknown, ...args: unknown[]) => unknown;

// Method decorator that translates errors thrown by the method according to an
// ordered rule list (first match wins). Each rule is a plain object; the
// variadic tuple generic infers the concrete error class per position, so
// `when`/`to` receive that class's instance type without a per-rule helper.
// Unmatched errors are rethrown as-is, so domain exceptions and genuine bugs
// pass through untouched. Order by specificity: a subclass rule must precede
// its superclass rule.
export function MapErrors<C extends readonly ErrorClass<Error>[]>(
  ...rules: {
    readonly [K in keyof C]: {
      readonly from: C[K];
      readonly when?: (error: InstanceType<C[K]>) => boolean;
      readonly to: (error: InstanceType<C[K]>) => Error;
    };
  }
): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as unknown as AsyncMethod;
    const list = rules as readonly ErrorRule[];
    const wrapped: AsyncMethod = async function (this: unknown, ...args) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        for (const rule of list) {
          if (error instanceof rule.from && (rule.when?.(error) ?? true)) {
            throw rule.to(error);
          }
        }
        throw error;
      }
    };
    (descriptor as PropertyDescriptor).value = wrapped;
    return descriptor;
  };
}
