import { ReviewEntity } from '@review/entity/review.entity.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import {
  SubjectReference,
  SubjectType,
} from '@review/domain/model/subject-reference.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';

const VALID_SUBJECT_TYPES = new Set<string>(Object.values(SubjectType));

export class ReviewMapper {
  static toDomain(entity: ReviewEntity): ReviewModel {
    if (!VALID_SUBJECT_TYPES.has(entity.subjectType)) {
      throw new InvalidReviewException(
        'Review contains an unrecognized subject type',
      );
    }
    return ReviewModel.reconstitute({
      id: entity.id,
      subjectRef: new SubjectReference(
        entity.subjectType as SubjectType,
        entity.subjectId,
      ),
      content: entity.content,
      rating: entity.rating,
      createdAt: entity.createdAt,
      authorId: entity.authorId,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(model: ReviewModel): ReviewEntity {
    const entity = new ReviewEntity();
    if (model.id !== undefined) {
      entity.id = model.id;
    }
    entity.content = model.content;
    entity.rating = model.rating;
    entity.subjectType = model.subjectRef.type;
    entity.subjectId = model.subjectRef.id;
    entity.authorId = model.authorId;
    if (model.createdAt !== undefined) {
      entity.createdAt = model.createdAt;
    }
    if (model.updatedAt !== null) {
      entity.updatedAt = model.updatedAt;
    }
    return entity;
  }
}
