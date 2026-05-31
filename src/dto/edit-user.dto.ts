import { Transform } from 'class-transformer/types/decorators/transform.decorator';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;
}
