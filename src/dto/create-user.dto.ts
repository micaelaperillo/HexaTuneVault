import { Transform } from 'class-transformer/types/decorators/transform.decorator';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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

  @IsString()
  profilePictureUrl!: string;
}
