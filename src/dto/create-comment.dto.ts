import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  createdById!: number;

  @IsInt()
  parentReviewId!: number;

  @IsOptional()
  @IsInt()
  parentCommentId?: number;
}
