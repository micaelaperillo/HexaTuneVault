import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SubjectSummary } from '@review/domain/model/subject-summary.js';

export class ReviewResponse {
  id!: number;
  content!: string;
  rating!: number;
  subject_type!: string;
  subject_id!: number;
  subject!: {
    id: number;
    name: string;
    type: string;
    image_url?: string;
  } | null;
  author_id!: number;
  created_at!: Date;
  updated_at!: Date | null;

  static fromDomain(
    model: ReviewModel,
    subject?: SubjectSummary,
  ): ReviewResponse {
    if (model.id === undefined || model.createdAt === undefined) {
      throw new Error('Cannot create response from unsaved review');
    }
    const response = new ReviewResponse();
    response.id = model.id;
    response.content = model.content;
    response.rating = model.rating;
    response.subject_type = model.subjectRef.type;
    response.subject_id = model.subjectRef.id;
    response.subject = subject
      ? {
          id: subject.id,
          name: subject.name,
          type: subject.type,
          image_url: subject.imageUrl,
        }
      : null;
    response.author_id = model.authorId;
    response.created_at = model.createdAt;
    response.updated_at = model.updatedAt;
    return response;
  }
}
