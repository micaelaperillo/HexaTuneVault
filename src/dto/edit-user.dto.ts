import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
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
