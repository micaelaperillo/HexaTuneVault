import { ReviewResponse } from './review-response.dto.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import {
  SubjectReference,
  SubjectType,
} from '@review/domain/model/subject-reference.js';
import { SubjectSummary } from '@review/domain/model/subject-summary.js';

describe('ReviewResponse', () => {
  const now = new Date();
  const savedModel = ReviewModel.reconstitute({
    id: 1,
    subjectRef: new SubjectReference(SubjectType.ALBUM, 10),
    content: 'Great album',
    rating: 5,
    createdAt: now,
    authorId: 42,
    updatedAt: null,
  });

  it('should map domain model with subject to response', () => {
    const subject = new SubjectSummary(
      10,
      'Album Name',
      SubjectType.ALBUM,
      'http://img.png',
    );

    const response = ReviewResponse.fromDomain(savedModel, subject);

    expect(response.id).toBe(1);
    expect(response.content).toBe('Great album');
    expect(response.rating).toBe(5);
    expect(response.subject_type).toBe('album');
    expect(response.subject_id).toBe(10);
    expect(response.author_id).toBe(42);
    expect(response.created_at).toBe(now);
    expect(response.updated_at).toBeNull();
    expect(response.subject).toEqual({
      id: 10,
      name: 'Album Name',
      type: 'album',
      image_url: 'http://img.png',
    });
  });

  it('should set subject to null when not provided', () => {
    const response = ReviewResponse.fromDomain(savedModel);

    expect(response.subject).toBeNull();
    expect(response.updated_at).toBeNull();
  });

  it('should throw when model has no id (unsaved)', () => {
    const unsaved = ReviewModel.create({
      subjectRef: new SubjectReference(SubjectType.TRACK, 1),
      content: 'Test',
      rating: 3,
      authorId: 1,
    });

    expect(() => ReviewResponse.fromDomain(unsaved)).toThrow(
      'Cannot create response from unsaved review',
    );
  });

  it('should map subject without imageUrl', () => {
    const subject = new SubjectSummary(10, 'Album Name', SubjectType.ALBUM);

    const response = ReviewResponse.fromDomain(savedModel, subject);

    expect(response.subject).toEqual({
      id: 10,
      name: 'Album Name',
      type: 'album',
      image_url: undefined,
    });
  });
});
