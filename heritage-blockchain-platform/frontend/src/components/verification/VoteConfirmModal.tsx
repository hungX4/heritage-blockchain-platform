import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { SubmitVotePayload } from '../../types/verification.type';

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
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="text-emerald-700" size={24} />,
    },
    REJECTED: {
      label: 'Từ chối / Không chấp thuận',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <XCircle className="text-rose-700" size={24} />,
    },
    ABSTAINED: {
      label: 'Phiếu trắng / Trắng phiếu',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <MinusCircle className="text-amber-700" size={24} />,
    },
  }[status];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-5 text-slate-800 font-sans">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-stone-100">{statusConfig.icon}</div>
          <div>
            <h3
              className="text-lg font-bold text-slate-900"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Xác Nhận Biểu Quyết
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Quyết định chuyên môn của bạn sẽ được niêm phong vào bản ghi thẩm định.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-stone-50 p-4 border border-stone-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Hồ sơ di sản:</span>
            <span
              className="font-bold text-slate-900 text-sm"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              {heritageName || 'Không xác định'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Quyết định biểu quyết:</span>
            <span className={`inline-block mt-1 px-2.5 py-1 rounded-md text-xs font-bold border ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Ý kiến chuyên môn:</span>
            <p className="mt-1 text-slate-700 italic whitespace-pre-line bg-white p-3 rounded-lg border border-stone-200">
              "{notes}"
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-lg bg-[#A50C1E] px-4 py-2 text-xs font-bold text-white hover:bg-red-800 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {loading ? 'Đang gửi...' : 'Xác nhận & Gửi'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
