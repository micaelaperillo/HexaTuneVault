export class CommentLikeCountResponse {
  comment_id!: number;
  count!: number;

  static fromCount(commentId: number, count: number): CommentLikeCountResponse {
    const response = new CommentLikeCountResponse();
    response.comment_id = commentId;
    response.count = count;
    return response;
  }
}
