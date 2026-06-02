import { Expose } from 'class-transformer';

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
  location!: string;

  @Expose()
  profilePictureUrl!: string;

  @Expose()
  followerCount!: number;

  @Expose()
  followingCount!: number;

  @Expose()
  self!: `/${string}`;
}
