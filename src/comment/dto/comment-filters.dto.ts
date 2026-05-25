import { IsInt, IsOptional, IsString } from 'class-validator';

export class CommentFiltersDto {
  @IsOptional()
  @IsInt()
  createdBy?: number;

  @IsOptional()
  @IsString()
  content?: string;
}
