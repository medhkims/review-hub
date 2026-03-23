export type FaqAudience = 'user' | 'business' | 'moderator';

export interface FaqEntity {
  id: string;
  question: string;
  answer: string;
  order: number;
  audience: FaqAudience[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
