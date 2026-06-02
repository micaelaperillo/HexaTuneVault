import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateReviewDto } from '../src/dto/create-review.dto';

describe('CreateReviewDto', () => {
  function transform(data: Record<string, unknown>): CreateReviewDto {
    return plainToInstance(CreateReviewDto, data);
  }

  function validate(data: Record<string, unknown>): string[] {
    const dto = transform(data);
    const errors = validateSync(dto);
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
  }

  it('should trim string content via @TrimString', () => {
    const dto = transform({
      content: '  Great album!  ',
      subject: { album: '1' },
      rating: 5,
    });
    expect(dto.content).toBe('Great album!');
  });

  it('should pass non-string content through unchanged', () => {
    const dto = transform({
      content: 123,
      subject: { album: '1' },
      rating: 5,
    });
    expect(dto.content).toBe(123);
  });

  it('should validate a valid request with no errors', () => {
    expect(
      validate({
        content: 'Great album!',
        subject: { album: '1' },
        rating: 5,
      }),
    ).toHaveLength(0);
  });

  it('accepts each subject variant', () => {
    for (const subject of [
      { album: '1' },
      { artist: '1' },
      { podcast: '1' },
      { track: '1' },
    ]) {
      expect(validate({ content: 'Test', subject, rating: 5 })).toHaveLength(0);
    }
  });

  it('should fail when rating is out of range', () => {
    const msgs = validate({
      content: 'Test',
      subject: { album: '1' },
      rating: 6,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when rating is below minimum', () => {
    const msgs = validate({
      content: 'Test',
      subject: { album: '1' },
      rating: 0,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when content is empty', () => {
    const msgs = validate({
      content: '',
      subject: { album: '1' },
      rating: 5,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when the subject key is not a known type', () => {
    const msgs = validate({
      content: 'Test',
      subject: { invalid: '1' },
      rating: 5,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when the subject has more than one key', () => {
    const msgs = validate({
      content: 'Test',
      subject: { album: '1', artist: '2' },
      rating: 5,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when the subject id is an empty string', () => {
    const msgs = validate({
      content: 'Test',
      subject: { album: '' },
      rating: 5,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when all required fields are missing', () => {
    const msgs = validate({});
    expect(msgs.length).toBeGreaterThan(0);
  });
});
