import type { UserModel } from '.';
import type { ReviewSubject } from './review-subject';

export type ReviewModel = {
  id: number;
  subject: ReviewSubject;
  content: string;
  rating: number;
  createdAt: Date;
  author: UserModel;
  updatedAt: Date | null;
};
