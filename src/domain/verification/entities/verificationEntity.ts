export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationEntity {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  idCardUrl: string;
  status: VerificationStatus;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}
