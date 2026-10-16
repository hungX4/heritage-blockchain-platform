import { createPortal } from 'react-dom'; // 👈 Import createPortal
import { AlertTriangle, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import type { SubmitVotePayload } from '../../schemas/vote.schema';

interface VoteConfirmModalProps {
  isOpen: boolean;
  heritageName?: string;
  pendingVote: {
    verificationId: string;
    payload: SubmitVotePayload;
  } | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function VoteConfirmModal({
  isOpen,
  heritageName,
  pendingVote,
  loading,
  onClose,
  onConfirm,
}: VoteConfirmModalProps) {
  if (!isOpen || !pendingVote) return null;

  const { status, notes } = pendingVote.payload;

  const statusConfig = {
    APPROVED: {
      label: 'Đồng ý / Chấp thuận',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="text-emerald-600" size={24} />,
    },
    REJECTED: {
      label: 'Từ chối / Không chấp thuận',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <XCircle className="text-rose-600" size={24} />,
    },
    ABSTAINED: {
      label: 'Phiếu trắng / Trắng phiếu',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <MinusCircle className="text-amber-600" size={24} />,
    },
  }[status];

  // 🟢 DÙNG CREATEPORTAL ĐỂ ĐẨY NÓ RA DOCUMENT.BODY
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-stone-200 space-y-5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-stone-100">{statusConfig.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Xác nhận biểu quyết</h3>
            <p className="text-sm text-slate-500 mt-1">
              Quyết định của bạn sẽ được ghi nhận vào biên bản thẩm định và không thể thay đổi sau khi gửi.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg bg-slate-50 p-4 border border-stone-200 text-sm">
          <div>
            <span className="text-slate-500 block text-xs font-semibold uppercase">Hồ sơ di sản:</span>
            <span className="font-semibold text-slate-900">{heritageName || 'Không xác định'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-xs font-semibold uppercase">Quyết định biểu quyết:</span>
            <span className={`inline-block mt-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-xs font-semibold uppercase">Ý kiến chuyên môn:</span>
            <p className="mt-1 text-slate-700 italic whitespace-pre-line bg-white p-2.5 rounded border border-stone-200">
              "{notes}"
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Xác nhận & Gửi'}
          </button>
        </div>
      </div>
    </div>,
    document.body // 👈 Đẩy thẳng ra ngoài root body
  );
}
