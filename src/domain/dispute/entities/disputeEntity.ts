export type DisputeStatus = 'pending' | 'reviewed' | 'upheld' | 'dismissed';

export type DisputeReason =
  | 'false_claims'
  | 'never_visited'
  | 'competitor'
  | 'defamatory'
  | 'outdated'
  | 'other';

export interface DisputeEntity {
  id: string;
  reviewId: string;
  businessId: string;
  businessName: string;
  reviewAuthorId: string;
  reviewAuthorName: string;
  reviewText: string;
  reviewRating: number;
  disputedById: string;
  disputedByName: string;
  disputedByEmail: string;
  reason: DisputeReason;
  explanation: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  adminNotes: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  resolvedById: string | null;
  reviewerNotifiedAt: Date | null;
  reviewerResponse: string | null;
}
