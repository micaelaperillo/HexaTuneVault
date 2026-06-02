export type UserModel = {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  biography: string;
  location?: string;
  profilePictureUrl: string;
  followerCount?: number;
  followingCount?: number;
};
