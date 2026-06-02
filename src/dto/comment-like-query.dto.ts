import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

/** Query params for reading a user's like state on a comment. */
export class CommentLikeQueryDto {
  @IsInt()
  @Type(() => Number)
  user_id!: number;
}
