/** Whether a user has liked a comment. */
export class CommentLikeStatusDto {
  liked!: boolean;

  constructor(liked: boolean) {
    this.liked = liked;
  }
}
