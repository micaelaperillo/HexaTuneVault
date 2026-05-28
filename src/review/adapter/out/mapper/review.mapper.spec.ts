import { ReviewMapper } from './review.mapper.js';
import { ReviewEntity } from '../entity/review.entity.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import {
  SubjectReference,
  SubjectType,
} from '@review/domain/model/subject-reference.js';
describe('ReviewMapper', () => {
  const now = new Date();

  describe('toDomain', () => {
    it('should map entity to domain model', () => {
      const entity = new ReviewEntity();
      entity.id = 1;
      entity.content = 'Great album';
      entity.rating = 5;
      entity.subjectType = 'album';
      entity.subjectId = 10;
      entity.authorId = 42;
      entity.createdAt = now;
      entity.updatedAt = null;

      const model = ReviewMapper.toDomain(entity);

      expect(model.id).toBe(1);
      expect(model.content).toBe('Great album');
      expect(model.rating).toBe(5);
      expect(model.subjectRef.type).toBe(SubjectType.ALBUM);
      expect(model.subjectRef.id).toBe(10);
      expect(model.authorId).toBe(42);
      expect(model.createdAt).toBe(now);
      expect(model.updatedAt).toBeNull();
    });

    it('should map entity with updatedAt to domain model', () => {
      const updatedAt = new Date();
      const entity = new ReviewEntity();
      entity.id = 2;
      entity.content = 'Updated review';
      entity.rating = 4;
      entity.subjectType = 'track';
      entity.subjectId = 5;
      entity.authorId = 3;
      entity.createdAt = now;
      entity.updatedAt = updatedAt;

      const model = ReviewMapper.toDomain(entity);

      expect(model.updatedAt).toBe(updatedAt);
    });
  });

  describe('toEntity', () => {
    it('should map saved domain model to entity with id', () => {
      const model = ReviewModel.reconstitute({
        id: 1,
        subjectRef: new SubjectReference(SubjectType.ALBUM, 10),
        content: 'Great album',
        rating: 5,
        createdAt: now,
        authorId: 42,
        updatedAt: null,
      });

      const entity = ReviewMapper.toEntity(model);

      expect(entity.id).toBe(1);
      expect(entity.content).toBe('Great album');
      expect(entity.rating).toBe(5);
      expect(entity.subjectType).toBe('album');
      expect(entity.subjectId).toBe(10);
      expect(entity.authorId).toBe(42);
      expect(entity.createdAt).toBe(now);
    });

    it('should omit id for new unsaved model', () => {
      const model = ReviewModel.create({
        subjectRef: new SubjectReference(SubjectType.TRACK, 5),
        content: 'Nice track',
        rating: 4,
        authorId: 3,
      });

      const entity = ReviewMapper.toEntity(model);

      expect(entity.id).toBeUndefined();
      expect(entity.content).toBe('Nice track');
      expect(entity.subjectType).toBe('track');
      expect(entity.subjectId).toBe(5);
    });

    it('should skip createdAt when undefined (new model)', () => {
      const model = ReviewModel.create({
        subjectRef: new SubjectReference(SubjectType.PODCAST, 1),
        content: 'Good podcast',
        rating: 3,
        authorId: 1,
      });

      const entity = ReviewMapper.toEntity(model);

      expect(entity.createdAt).toBeUndefined();
    });

    it('should set updatedAt when not null', () => {
      const updatedAt = new Date();
      const model = ReviewModel.reconstitute({
        id: 1,
        subjectRef: new SubjectReference(SubjectType.ARTIST, 1),
        content: 'Great artist',
        rating: 5,
        createdAt: now,
        authorId: 1,
        updatedAt,
      });

      const entity = ReviewMapper.toEntity(model);

      expect(entity.updatedAt).toBe(updatedAt);
    });

    it('should set updatedAt to null when null', () => {
      const model = ReviewModel.reconstitute({
        id: 1,
        subjectRef: new SubjectReference(SubjectType.ALBUM, 1),
        content: 'Test',
        rating: 3,
        createdAt: now,
        authorId: 1,
        updatedAt: null,
      });

      const entity = ReviewMapper.toEntity(model);

      expect(entity.updatedAt).toBeNull();
    });
  });
});
