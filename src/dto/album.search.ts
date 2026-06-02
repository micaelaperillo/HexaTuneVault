import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
} from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TrimString } from './transforms';

@ValidatorConstraint({ name: 'atLeastOneAlbumFilter', async: false })
class AtLeastOneAlbumFilterConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as AlbumSearchDto;
    return (
      dto.q !== undefined || dto.artist !== undefined || dto.year !== undefined
    );
  }

  defaultMessage(): string {
    return 'at least one of q, artist or year must be provided';
  }
}

export class AlbumSearchDto {
  @IsOptional()
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly q?: string;

  @IsOptional()
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly artist?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  readonly year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Validate(AtLeastOneAlbumFilterConstraint)
  readonly page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  readonly page_size: number = 10;
}
