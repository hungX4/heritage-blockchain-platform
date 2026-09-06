export type HeritageStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'PUBLISHED';

export type Heritage = {
  id: string;
  heritageCode: string;
  name: string;
  description: string;
  category: string;
  source: string;
  sourceOrganization: string;
  sourceReference: string;
  status: HeritageStatus;
  createdBy?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type HeritagePayload = {
  heritageCode: string;
  name: string;
  description: string;
  category: string;
  source: string;
  sourceOrganization: string;
  sourceReference: string;
};

export type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T;
};

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type Verification = {
  id: string;
  heritageId: string;
  reviewerId?: string;
  status: VerificationStatus;
  notes?: string;
  heritage?: Heritage;
  createdAt: string;
  updatedAt: string;
};

export type HeritageVersion = {
  id: string;
  heritageId: string;
  version: number;
  canonicalData: Record<string, string | number>;
  dataHash: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};
