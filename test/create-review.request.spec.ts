import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateReviewRequest } from '../src/dto/create-review.request';
import { SubjectType } from '../src/model/subject-reference';

describe('CreateReviewRequest', () => {
  function transform(data: Record<string, unknown>): CreateReviewRequest {
    return plainToInstance(CreateReviewRequest, data);
  }

  function validate(data: Record<string, unknown>): string[] {
    const dto = transform(data);
    const errors = validateSync(dto);
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
  }

  it('should trim string content via @Transform', () => {
    const dto = transform({
      content: '  Great album!  ',
      subject_type: SubjectType.ALBUM,
      subject_id: '1',
      rating: 5,
    });
    expect(dto.content).toBe('Great album!');
  });

  it('should pass non-string content through unchanged', () => {
    const dto = transform({
      content: 123,
      subject_type: SubjectType.ALBUM,
      subject_id: '1',
      rating: 5,
    });
    expect(dto.content).toBe(123);
  });

  it('should validate a valid request with no errors', () => {
    expect(
      validate({
        content: 'Great album!',
        subject_type: SubjectType.ALBUM,
        subject_id: '1',
        rating: 5,
      }),
    ).toHaveLength(0);
  });

  it('should fail when rating is out of range', () => {
    const msgs = validate({
      content: 'Test',
      subject_type: SubjectType.ALBUM,
      subject_id: '1',
      rating: 6,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when rating is below minimum', () => {
    const msgs = validate({
      content: 'Test',
      subject_type: SubjectType.ALBUM,
      subject_id: '1',
      rating: 0,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when content is empty', () => {
    const msgs = validate({
      content: '',
      subject_type: SubjectType.ALBUM,
      subject_id: '1',
      rating: 5,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when subject_type is invalid', () => {
    const msgs = validate({
      content: 'Test',
      subject_type: 'invalid',
      subject_id: '1',
      rating: 5,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when all required fields are missing', () => {
    const msgs = validate({});
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when subject_id is an empty string', () => {
    const msgs = validate({
      content: 'Test',
      subject_type: SubjectType.ALBUM,
      subject_id: '',
      rating: 5,
    });
    expect(msgs.length).toBeGreaterThan(0);
  });
});
