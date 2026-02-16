export interface ProfileEntity {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
}
