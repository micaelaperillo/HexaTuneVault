import { TrimString } from './transforms';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @TrimString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @TrimString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @TrimString()
  first_name!: string;

  @IsString()
  @TrimString()
  last_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  biography!: string;

  @IsOptional()
  @IsString()
  @TrimString()
  @MaxLength(256)
  location?: string;

  @IsString()
  profile_picture_url!: string;
}
