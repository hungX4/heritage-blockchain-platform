export type VerificationStatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ABSTAINED';
import { z } from 'zod';

export const submitVoteSchema = z.object({
  // z.enum ở đây tạo ra type: 'APPROVED' | 'REJECTED' | 'ABSTAINED' (không dùng TS Enum)
  status: z.enum(['APPROVED', 'REJECTED', 'ABSTAINED']),
  notes: z
    .string()
    .trim()
    .min(1, 'Lý do / ý kiến đánh giá không được để trống!')
    .min(10, 'Ý kiến nhận xét phải có ít nhất 10 ký tự để đảm bảo tính minh bạch.'),
});

export type SubmitVotePayload = z.infer<typeof submitVoteSchema>;
