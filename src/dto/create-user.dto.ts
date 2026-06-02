import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  username!: string;

  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  password!: string;

  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  first_name!: string;

  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  last_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  biography!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @MaxLength(256)
  location?: string;

  @IsString()
  profile_picture_url!: string;
}
