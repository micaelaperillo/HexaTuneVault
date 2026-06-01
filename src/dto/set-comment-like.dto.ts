import { Type } from 'class-transformer/types/decorators/type.decorator';
import { IsBoolean, IsInt } from 'class-validator';

export class SetCommentLikeDto {
  @IsInt()
  @Type(() => Number)
  user_id!: number;

  @IsBoolean()
  liked!: boolean;
}
