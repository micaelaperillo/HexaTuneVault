export class UserLinkDto {
  readonly user: `/${string}`;

  constructor(userId: string) {
    this.user = `/api/users/${userId}`;
  }

  static from(this: void, userId: string): UserLinkDto {
    return new UserLinkDto(userId);
  }

  static fromMany(userIds: string[]): UserLinkDto[] {
    return userIds.map(UserLinkDto.from);
  }
}
