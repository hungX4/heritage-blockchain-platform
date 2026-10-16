import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, MinusCircle, Clock, CheckCheck, ListFilter } from 'lucide-react';
import { verificationApi, type Verification } from '../../api/verification.api';
import { VoteConfirmModal } from './VoteConfirmModal';
import { SubmitVotePayload, submitVoteSchema } from '../../types/verification.type';

interface MyAssignmentsTabProps {
  assignments: Verification[];
  loading: boolean;
  onRefresh: () => void;
}

type FilterStatusType = 'ALL' | 'PENDING' | 'COMPLETED';

export function MyAssignmentsTab({ assignments, loading, onRefresh }: MyAssignmentsTabProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>('PENDING');
  const [voteNotes, setVoteNotes] = useState<Record<string, string>>({});

  // 🟢 Lưu vết các hồ sơ vừa vote thành công ở Client để chống ghi đè dữ liệu cũ từ server
  const [votedMap, setVotedMap] = useState<Record<string, { status: string; notes: string }>>({});

  const [pendingVote, setPendingVote] = useState<{
    verificationId: string;
    heritageName?: string;
    payload: SubmitVotePayload;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // 🟢 Hàm kết hợp dữ liệu gốc với các phiếu vừa vote ở local
  const effectiveAssignments = assignments.map((item) => {
    const localVote = votedMap[item.id];
    if (localVote) {
      return {
        ...item,
        status: localVote.status,
        notes: localVote.notes,
      };
    }
    return item;
  });

  // Tính toán số lượng dựa trên dữ liệu đã được đồng bộ chuẩn
  const pendingCount = effectiveAssignments.filter((item) => item.status === 'PENDING').length;
  const completedCount = effectiveAssignments.filter((item) => item.status !== 'PENDING').length;

  // Lọc danh sách hiển thị theo tab
  const filteredAssignments = effectiveAssignments.filter((item) => {
    if (filterStatus === 'PENDING') return item.status === 'PENDING';
    if (filterStatus === 'COMPLETED') return item.status !== 'PENDING';
    return true;
  });

  const handleInitiateVote = (
    verificationId: string,
    heritageName: string | undefined,
    status: 'APPROVED' | 'REJECTED' | 'ABSTAINED'
  ) => {
    const rawNotes = voteNotes[verificationId] || '';
    const result = submitVoteSchema.safeParse({ status, notes: rawNotes });

    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || 'Thông tin biểu quyết không hợp lệ';
      toast.error(errorMessage);
      return;
    }

    setPendingVote({
      verificationId,
      heritageName,
      payload: result.data,
    });
  };

  const handleConfirmVote = async () => {
    if (!pendingVote) return;

    setSubmitting(true);
    try {
      // 1. Gửi request lên server
      const res = await verificationApi.submitVote(pendingVote.verificationId, pendingVote.payload);
      toast.success(res.data?.message || 'Đã gửi phiếu đánh giá thành công!');

      // 🟢 2. GHI NHỚ NGAY TRẠNG THÁI VỪA VOTE VÀO LOCAL MAP
      setVotedMap((prev) => ({
        ...prev,
        [pendingVote.verificationId]: {
          status: pendingVote.payload.status,
          notes: pendingVote.payload.notes,
        },
      }));

      // 🟢 3. CHUYỂN TAB SANG "ĐÃ THẨM ĐỊNH"
      setFilterStatus('COMPLETED');

      // 4. Dọn dẹp form & đóng modal
      setVoteNotes((prev) => {
        const updated = { ...prev };
        delete updated[pendingVote.verificationId];
        return updated;
      });
      setPendingVote(null);

      // 5. Reload lại server data ngầm
      try {
        await onRefresh();
      } catch {
        // Lỗi refresh ngầm
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi biểu quyết thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && assignments.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-500">Đang tải danh sách nhiệm vụ...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Bộ lọc trạng thái */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setFilterStatus('PENDING')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${filterStatus === 'PENDING'
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <Clock size={14} />
          Chưa làm / Chờ duyệt ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('COMPLETED')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${filterStatus === 'COMPLETED'
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <CheckCheck size={14} />
          Đã thẩm định ({completedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('ALL')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${filterStatus === 'ALL'
            ? 'bg-slate-900 text-white'
            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <ListFilter size={14} />
          Tất cả ({effectiveAssignments.length})
        </button>
      </div>

      {/* Danh sách nhiệm vụ */}
      {filteredAssignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-slate-500">
          {filterStatus === 'PENDING' && 'Không có hồ sơ nào đang chờ bạn biểu quyết.'}
          {filterStatus === 'COMPLETED' && 'Bạn chưa biểu quyết hồ sơ nào.'}
          {filterStatus === 'ALL' && 'Không tìm thấy hồ sơ di sản nào.'}
        </div>
      ) : (
        filteredAssignments.map((item) => {
          const isPending = item.status === 'PENDING';

          return (
            <div key={item.id} className="rounded-lg border border-stone-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">{item.heritage?.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Mã hồ sơ: {item.heritage?.heritageCode}</p>
                </div>

                {!isPending ? (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${item.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                  >
                    {item.status === 'APPROVED' && (
                      <>
                        <CheckCircle2 size={14} /> Đã chấp thuận
                      </>
                    )}
                    {item.status === 'REJECTED' && (
                      <>
                        <XCircle size={14} /> Đã từ chối
                      </>
                    )}
                    {item.status === 'ABSTAINED' && (
                      <>
                        <MinusCircle size={14} /> Phiếu trắng
                      </>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                    <Clock size={14} /> Chờ biểu quyết
                  </span>
                )}
              </div>

              {isPending ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Ý kiến chuyên môn <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded border border-stone-300 p-2 text-sm outline-none focus:border-emerald-700"
                      placeholder="Nhập nhận xét chi tiết và căn cứ chuyên môn (bắt buộc, tối thiểu 10 ký tự)..."
                      value={voteNotes[item.id] || ''}
                      onChange={(e) =>
                        setVoteNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      className="rounded bg-emerald-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 transition-colors"
                      onClick={() => handleInitiateVote(item.id, item.heritage?.name, 'APPROVED')}
                    >
                      Chấp thuận
                    </button>
                    <button
                      type="button"
                      className="rounded bg-rose-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors"
                      onClick={() => handleInitiateVote(item.id, item.heritage?.name, 'REJECTED')}
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      className="rounded bg-slate-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-600 transition-colors"
                      onClick={() => handleInitiateVote(item.id, item.heritage?.name, 'ABSTAINED')}
                    >
                      Phiếu trắng
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Ý kiến chuyên môn đã ghi nhận:
                  </span>
                  <div className="rounded-lg border border-stone-200 bg-slate-50 p-3 text-sm italic text-slate-700">
                    "{item.notes || 'Không có nhận xét bổ sung.'}"
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modal Popup xác nhận */}
      <VoteConfirmModal
        isOpen={!!pendingVote}
        heritageName={pendingVote?.heritageName}
        pendingVote={pendingVote}
        loading={submitting}
        onClose={() => setPendingVote(null)}
        onConfirm={handleConfirmVote}
      />
    </div>
  );
}
