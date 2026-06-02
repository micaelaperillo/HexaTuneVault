import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id!: number;

  @Expose()
  username!: string;

  @Expose()
  first_name!: string;

  @Expose()
  last_name!: string;

  @Expose()
  email!: string;

  @Expose()
  biography!: string;

  @Expose()
  location!: string;

  @Expose()
  profile_picture_url!: string;

  @Expose()
  follower_count!: number;

  @Expose()
  following_count!: number;

  @Expose()
  self!: `/${string}`;
}
