import { UserModel } from '../user';
import { ReviewModel } from '../review';

export type CommentModel = {
  id: number;
  content: string;
  createdAt: Date;
  createdBy: UserModel;
  parentReview: ReviewModel;
  // Use the comment id to prevent accidental infinite loops
  parentCommentId: CommentModel['id'] | null;
  likes: number;
};
