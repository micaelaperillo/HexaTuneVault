import { Type } from 'class-transformer/types/decorators/type.decorator';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  @Type(() => Number)
  createdById!: number;

  @IsInt()
  @Type(() => Number)
  parentReviewId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentCommentId?: number;
}
