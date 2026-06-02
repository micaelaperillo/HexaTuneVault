import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  @Type(() => Number)
  parent_review_id!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parent_comment_id?: number;
}
