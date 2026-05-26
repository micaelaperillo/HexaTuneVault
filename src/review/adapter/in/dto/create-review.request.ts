import { IsString, Length, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { SubjectType } from '@review/domain/model/subject-reference.js';

export class CreateReviewRequest {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(1, 500)
  content!: string;

  @IsEnum(SubjectType)
  subject_type!: SubjectType;

  @IsInt()
  @Min(1)
  subject_id!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
