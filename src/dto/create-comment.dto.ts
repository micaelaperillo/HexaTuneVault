import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AssociatedType } from '../model/associated-type';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  createdBy!: string;

  @IsString()
  @IsNotEmpty()
  associatedTo!: string;

  @IsEnum(AssociatedType)
  associatedType!: AssociatedType;
}
