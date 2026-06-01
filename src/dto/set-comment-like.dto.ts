import { IsBoolean, IsInt } from 'class-validator';

export class SetCommentLikeDto {
  @IsInt()
  user_id!: number;

  @IsBoolean()
  liked!: boolean;
}
