import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  TrimString,
  TrimStringArray,
  ToNumber,
  ToArray,
} from '../../../../../../src/adapter/in/http/dto/transforms';

class TrimStringDto {
  @TrimString()
  value!: unknown;
}

class TrimStringArrayDto {
  @TrimStringArray()
  items!: unknown;
}

class ToNumberDto {
  @ToNumber()
  value!: unknown;
}

class ToArrayDto {
  @ToArray()
  items!: unknown;
}

describe('TrimString', () => {
  function transform(value: unknown): unknown {
    return plainToInstance(TrimStringDto, { value }).value;
  }

  it('trims a string value', () => {
    expect(transform('  hello  ')).toBe('hello');
  });

  it('returns a non-string value untouched', () => {
    expect(transform(42)).toBe(42);
  });

  it('returns null untouched', () => {
    expect(transform(null)).toBe(null);
  });
});

describe('TrimStringArray', () => {
  function transform(items: unknown): unknown {
    return plainToInstance(TrimStringArrayDto, { items }).items;
  }

  it('trims each string element of an array', () => {
    expect(transform(['  a  ', '  b  '])).toEqual(['a', 'b']);
  });

  it('leaves non-string elements in an array untouched', () => {
    expect(transform([42, '  hello  '])).toEqual([42, 'hello']);
  });

  it('returns a non-array value untouched', () => {
    expect(transform('not-an-array')).toBe('not-an-array');
  });

  it('returns a non-array number untouched', () => {
    expect(transform(99)).toBe(99);
  });
});

describe('ToNumber', () => {
  function transform(value: unknown): unknown {
    return plainToInstance(ToNumberDto, { value }).value;
  }

  it('coerces a numeric string to a number', () => {
    expect(transform('42')).toBe(42);
  });

  it('yields NaN for a non-numeric value', () => {
    expect(transform('abc')).toBeNaN();
  });
});

describe('ToArray', () => {
  function transform(items: unknown): unknown {
    return plainToInstance(ToArrayDto, { items }).items;
  }

  it('leaves an array untouched', () => {
    expect(transform(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('wraps a single value in an array', () => {
    expect(transform('a')).toEqual(['a']);
  });
});
