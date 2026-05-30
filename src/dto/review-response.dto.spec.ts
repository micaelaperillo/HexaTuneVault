import { ReviewResponse } from './review-response.dto';
import { ReviewModel } from '../model/review.model';
import { SubjectReference, SubjectType } from '../model/subject-reference';

describe('ReviewResponse', () => {
  const now = new Date();
  const savedModel = ReviewModel.reconstitute({
    id: 1,
    subjectRef: new SubjectReference(SubjectType.ALBUM, '10'),
    content: 'Great album',
    rating: 5,
    createdAt: now,
    authorId: '42',
    updatedAt: null,
  });

  it('should map domain model to response with subject references', () => {
    const response = ReviewResponse.fromDomain(savedModel);

    expect(response.id).toBe(1);
    expect(response.content).toBe('Great album');
    expect(response.rating).toBe(5);
    expect(response.subject_type).toBe('album');
    expect(response.subject_id).toBe('10');
    expect(response.author_id).toBe('42');
    expect(response.created_at).toBe(now);
    expect(response.updated_at).toBeNull();
  });

  it('should include HATEOAS links', () => {
    const response = ReviewResponse.fromDomain(savedModel);

    expect(response.self).toBe('/api/reviews/1');
    expect(response.collection).toBe('/api/reviews');
    expect(response.subject).toBe('/api/albums/10');
    expect(response.author).toBe('/api/users/42');
  });

  it('should throw when model has no id (unsaved)', () => {
    const unsaved = ReviewModel.create({
      subjectRef: new SubjectReference(SubjectType.TRACK, '1'),
      content: 'Test',
      rating: 3,
      authorId: '1',
    });

    expect(() => ReviewResponse.fromDomain(unsaved)).toThrow(
      'Cannot create response from unsaved review',
    );
  });
});
