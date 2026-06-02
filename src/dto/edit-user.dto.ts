import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  first_name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @MaxLength(256)
  location?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;
}
