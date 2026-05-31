import { Expose, plainToInstance } from 'class-transformer';
import { JwtModel } from '../model/jwt.model';

export class AuthResponseDto {
  @Expose()
  accessToken!: string;

  static from(model: JwtModel): AuthResponseDto {
    return plainToInstance(AuthResponseDto, model, {
      excludeExtraneousValues: true,
    });
  }
}
