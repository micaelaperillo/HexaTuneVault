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
  @Expose()
  followerCount!: number;
  @Expose()
  followingCount!: number;

  static from(model: UserModel): UserResponseDto {
    const dto = plainToInstance(UserResponseDto, model, {
      excludeExtraneousValues: true,
    });
    dto.followerCount = model.followerCount ?? 0;
    dto.followingCount = model.followingCount ?? 0;
    return dto;
  }

  static fromMany(models: UserModel[]): UserResponseDto[] {
    return models.map((model) => UserResponseDto.from(model));
  }
}
