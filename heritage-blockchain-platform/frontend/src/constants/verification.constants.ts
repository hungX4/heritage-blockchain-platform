import type { VerificationStatusType } from '../types/verification.type';

export const HERITAGE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Bản nháp', color: 'bg-stone-100 text-stone-700' },
  SUBMITTED: { label: 'Đã gửi', color: 'bg-blue-50 text-blue-700' },
  UNDER_REVIEW: { label: 'Đang thẩm định', color: 'bg-amber-50 text-amber-800' },
  VERIFIED: { label: 'Đã xác thực', color: 'bg-emerald-50 text-emerald-800' },
  REJECTED: { label: 'Từ chối', color: 'bg-red-50 text-red-700' },
  PUBLISHED: { label: 'Công khai', color: 'bg-purple-50 text-purple-700' }
};

export const VOTE_STATUS_BADGES: Record<VerificationStatusType, { label: string; color: string }> = {
  PENDING: { label: 'Chưa bỏ phiếu', color: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: 'Đã Phê duyệt', color: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Đã Từ chối', color: 'bg-red-100 text-red-800' },
  ABSTAINED: { label: 'Phiếu trắng', color: 'bg-slate-200 text-slate-800' },
};
