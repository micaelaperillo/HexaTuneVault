import { TrimString } from './transforms';
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
  @TrimString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  @TrimString()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsString()
  @TrimString()
  @IsNotEmpty()
  first_name?: string;

  @IsOptional()
  @IsString()
  @TrimString()
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
  @TrimString()
  @MaxLength(256)
  location?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;
}
