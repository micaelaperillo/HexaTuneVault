import type { ReviewModel } from '../model/review.model';
import { SubjectType } from '../model/subject-reference';

export class ReviewResponse {
  id!: number;
  content!: string;
  rating!: number;
  subject_type!: SubjectType;
  subject_id!: string;
  author_id!: string;
  created_at!: Date;
  updated_at!: Date | null;
  self!: `/${string}`;
  collection!: `/${string}`;
  subject!: `/${string}`;
  author!: `/${string}`;

  static fromDomain(model: ReviewModel): ReviewResponse {
    if (model.id === undefined || model.createdAt === undefined) {
      throw new Error('Cannot create response from unsaved review');
    }
    const response = new ReviewResponse();
    response.id = model.id;
    response.content = model.content;
    response.rating = model.rating;
    response.subject_type = model.subjectRef.type;
    response.subject_id = model.subjectRef.id;
    response.author_id = model.authorId;
    response.created_at = model.createdAt;
    response.updated_at = model.updatedAt;
    response.self = `/api/reviews/${model.id}`;
    response.collection = `/api/reviews`;
    response.subject = `/api/${model.subjectRef.type}s/${model.subjectRef.id}`;
    response.author = `/api/users/${model.authorId}`;
    return response;
  }
}
