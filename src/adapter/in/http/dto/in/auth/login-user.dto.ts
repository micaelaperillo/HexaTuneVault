import { TrimString } from '../../transforms';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @TrimString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @TrimString()
  @IsNotEmpty()
  password!: string;
}
