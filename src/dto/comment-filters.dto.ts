import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssociatedType } from '../model/associated-type.enum';

export class CommentFiltersDto {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(AssociatedType)
  associatedType?: typeof AssociatedType;
}
