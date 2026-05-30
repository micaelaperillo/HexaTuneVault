import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssociatedType } from '../model/comment.associated.type';

export class CommentFiltersDto {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(AssociatedType)
  associatedType?: AssociatedType;
}
