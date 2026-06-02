import { Expose } from 'class-transformer';

export class UserLinkDto {
  @Expose()
  readonly user!: `/${string}`;
}
