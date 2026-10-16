import { SubmitVotePayload, VerificationStatusType } from '../types/verification.type';
import axiosClient from './axiosClient';

export interface Verification {
  id: string;
  heritageId: string;
  expertId: string;
  status: VerificationStatusType
  notes?: string;
  createdAt: string;
  updatedAt: string;
  heritage?: any;
  expert?: any;
}

// Bọc Response chung từ Backend
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Response riêng cho API Auto Assign
export interface AutoAssignData {
  message: string;
  totalExperts: number;
  expertIds: string[];
}

// Response riêng cho API Submit Vote
export interface VoteResultData {
  currentApproved: number;
  currentRejected: number;
  currentAbstained: number;
  totalAssigned: number;
  completedCount: number;
  heritageStatus: string;
  isFinalized: boolean;
}

// --- API SERVICE ---
export const verificationApi = {
  /**
   * 1. Lấy danh sách hồ sơ phân công cho Chuyên gia hiện tại
   */
  getMyAssignments: () => {
    return axiosClient.get<ApiResponse<Verification[]>>('/verifications/my-assignments');
  },

  /**
   * 2. Lấy danh sách 5 chuyên gia & phiếu bầu của một di sản
   */
  getVerificationsByHeritage: (heritageId: string) => {
    return axiosClient.get<ApiResponse<Verification[]>>(`/verifications/heritage/${heritageId}`);
  },

  /**
   * 3. Chuyên gia bỏ phiếu (APPROVED / REJECTED)
   */
  submitVote: (verificationId: string, payload: SubmitVotePayload) => {
    return axiosClient.post<ApiResponse<VoteResultData>>(`/verifications/${verificationId}/vote`, payload);
  },

  /**
   * 4. Admin kích hoạt lại Auto Matching 5 Chuyên gia
   */
  triggerAutoAssign: (heritageId: string, requiredExperts: number) => {
    return axiosClient.post<ApiResponse<AutoAssignData>>(`/verifications/heritage/${heritageId}/auto-assign`, { requiredExperts });
  },
};
