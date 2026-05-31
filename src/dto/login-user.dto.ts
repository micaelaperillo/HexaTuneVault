import { Transform } from 'class-transformer/types/decorators/transform.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  username!: string;

  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  password!: string;
}
