export interface CommentModel {
  id: number;
  content: string;
  createdAt: Date;
  createdById: number;
  parentReviewId: number;
  parentCommentId: number | null;
  likes: number;
}
