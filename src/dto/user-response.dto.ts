import { Expose, plainToInstance } from 'class-transformer';
import { UserModel } from '../model/user.model';

export class UserResponseDto {
  @Expose()
  id!: number;
  @Expose()
  username!: string;
  @Expose()
  firstName!: string;
  @Expose()
  lastName!: string;
  @Expose()
  email!: string;
  @Expose()
  biography!: string;
  @Expose()
  profilePictureUrl!: string;

  static from(model: UserModel): UserResponseDto {
    return plainToInstance(UserResponseDto, model, {
      excludeExtraneousValues: true,
    });
  }

  static fromMany(models: UserModel[]): UserResponseDto[] {
    return models.map((model) => UserResponseDto.from(model));
  }
}
