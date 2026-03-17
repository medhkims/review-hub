export interface AdminContactItemModel {
  id: string;
  label: string;
  value: string;
  visible_to: string[];
}

export interface AdminAddressModel {
  value: string;
  visible_to: string[];
}

export interface AdminInfoModel {
  picture_url: string | null;
  address: AdminAddressModel | null;
  emails: AdminContactItemModel[];
  phones: AdminContactItemModel[];
}
