export interface AnnouncementEntity {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  validUntil: Date | null;
  createdAt: Date;
}
