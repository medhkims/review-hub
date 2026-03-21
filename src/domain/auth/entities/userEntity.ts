export interface UserEntity {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
  birthday: Date | null;
  provider: 'email' | 'google' | 'facebook' | 'apple';
}
