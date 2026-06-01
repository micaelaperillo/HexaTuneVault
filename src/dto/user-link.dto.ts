export class UserLinkDto {
  readonly user: `/${string}`;

  constructor(userId: string | number) {
    this.user = `/api/users/${userId}`;
  }

  static from(this: void, userId: string | number): UserLinkDto {
    return new UserLinkDto(userId);
  }

  static fromMany(userIds: (string | number)[]): UserLinkDto[] {
    return userIds.map(UserLinkDto.from);
  }
}
