import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { AssociatedType } from '../model/associated-type.enum';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  createdBy!: number;

  @IsInt()
  @IsPositive()
  associatedTo!: number;

  @IsEnum(AssociatedType)
  associatedType!: AssociatedType;
}
