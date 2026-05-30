import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AssociatedType } from '../model/associated-type.enum';

export class CommentFiltersDto {
  @IsOptional()
  @IsInt()
  createdBy?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(AssociatedType)
  associatedType?: AssociatedType;
}
