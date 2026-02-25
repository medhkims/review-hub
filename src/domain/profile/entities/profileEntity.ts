import { UserRole } from './userRole';

export interface ProfileEntity {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  phoneNumber: string | null;
  bio: string;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  role: UserRole;
  updatedAt: Date;
}
