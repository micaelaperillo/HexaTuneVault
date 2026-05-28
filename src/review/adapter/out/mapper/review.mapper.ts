import { ReviewEntity } from '../entity/review.entity.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { SubjectReference } from '@review/domain/model/subject-reference.js';

export class ReviewMapper {
  static toDomain(entity: ReviewEntity): ReviewModel {
    return ReviewModel.reconstitute({
      id: entity.id,
      subjectRef: new SubjectReference(entity.subjectType, entity.subjectId),
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
    entity.updatedAt = model.updatedAt;
    return entity;
  }
}
