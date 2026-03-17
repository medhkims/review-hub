import { UserRole } from './userRole';

export type Gender = 'male' | 'female';

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
  gender: Gender | null;
  updatedAt: Date;
}
