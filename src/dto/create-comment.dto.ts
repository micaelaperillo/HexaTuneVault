import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  @Type(() => Number)
  parentReviewId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentCommentId?: number;
}
