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
  firstName!: string;

  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  lastName!: string;

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
  profilePictureUrl!: string;
}
