export type VisibleTo = 'business_owner' | 'simple_user' | 'moderator';

export interface AdminContactItem {
  id: string;
  label: string;
  value: string;
  visibleTo: VisibleTo[];
}

export interface AdminAddressItem {
  value: string;
  visibleTo: VisibleTo[];
}

export interface AdminInfoEntity {
  pictureUrl: string | null;
  address: AdminAddressItem | null;
  emails: AdminContactItem[];
  phones: AdminContactItem[];
}
