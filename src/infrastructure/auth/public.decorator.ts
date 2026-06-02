import { Reflector } from '@nestjs/core';

// The decorator reference itself is the metadata key (no magic string/symbol).
// `transform` lets call sites stay `@Public()` with no argument while the
// stored value is `true`.
export const Public = Reflector.createDecorator<void, boolean>({
  transform: () => true,
});
