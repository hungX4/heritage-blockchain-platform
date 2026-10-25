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

  const [votedMap, setVotedMap] = useState<Record<string, { status: string; notes: string }>>({});

  const [pendingVote, setPendingVote] = useState<{
    verificationId: string;
    heritageName?: string;
    payload: SubmitVotePayload;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);

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

  const pendingCount = effectiveAssignments.filter((item) => item.status === 'PENDING').length;
  const completedCount = effectiveAssignments.filter((item) => item.status !== 'PENDING').length;

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
      const res = await verificationApi.submitVote(pendingVote.verificationId, pendingVote.payload);
      toast.success(res.data?.message || 'Đã gửi phiếu đánh giá thành công!');

      setVotedMap((prev) => ({
        ...prev,
        [pendingVote.verificationId]: {
          status: pendingVote.payload.status,
          notes: pendingVote.payload.notes,
        },
      }));

      setFilterStatus('COMPLETED');

      setVoteNotes((prev) => {
        const updated = { ...prev };
        delete updated[pendingVote.verificationId];
        return updated;
      });
      setPendingVote(null);

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
    return <div className="py-12 text-center text-xs text-slate-500">Đang tải danh sách nhiệm vụ thẩm định...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Bộ lọc trạng thái */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setFilterStatus('PENDING')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${filterStatus === 'PENDING'
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <Clock size={14} />
          Chưa làm / Chờ duyệt ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('COMPLETED')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${filterStatus === 'COMPLETED'
            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <CheckCheck size={14} />
          Đã thẩm định ({completedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('ALL')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${filterStatus === 'ALL'
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
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-xs text-slate-500 font-sans">
          {filterStatus === 'PENDING' && 'Không có hồ sơ nào đang chờ bạn biểu quyết.'}
          {filterStatus === 'COMPLETED' && 'Bạn chưa biểu quyết hồ sơ nào.'}
          {filterStatus === 'ALL' && 'Không tìm thấy hồ sơ di sản nào.'}
        </div>
      ) : (
        filteredAssignments.map((item) => {
          const isPending = item.status === 'PENDING';

          return (
            <div key={item.id} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
                <div>
                  <h3
                    className="font-bold text-slate-900 text-base"
                    style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                  >
                    {item.heritage?.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Mã hồ sơ: <span className="font-mono text-slate-800 font-semibold">{item.heritage?.heritageCode}</span></p>
                </div>

                {!isPending ? (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${item.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                  >
                    {item.status === 'APPROVED' && (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-700" /> Đã chấp thuận
                      </>
                    )}
                    {item.status === 'REJECTED' && (
                      <>
                        <XCircle size={14} className="text-rose-700" /> Đã từ chối
                      </>
                    )}
                    {item.status === 'ABSTAINED' && (
                      <>
                        <MinusCircle size={14} className="text-amber-700" /> Phiếu trắng
                      </>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border bg-amber-50 text-amber-800 border-amber-200">
                    <Clock size={14} /> Chờ biểu quyết
                  </span>
                )}
              </div>

              {isPending ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Ý kiến chuyên môn <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-stone-300 p-2.5 text-xs text-slate-800 outline-none transition-colors focus:border-[#A50C1E]"
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
                      className="rounded-lg bg-[#A50C1E] px-4 py-2 text-xs font-bold text-white hover:bg-red-800 transition-colors cursor-pointer shadow-xs"
                      onClick={() => handleInitiateVote(item.id, item.heritage?.name, 'APPROVED')}
                    >
                      Chấp thuận
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-rose-800 px-4 py-2 text-xs font-bold text-white hover:bg-rose-900 transition-colors cursor-pointer shadow-xs"
                      onClick={() => handleInitiateVote(item.id, item.heritage?.name, 'REJECTED')}
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                      onClick={() => handleInitiateVote(item.id, item.heritage?.name, 'ABSTAINED')}
                    >
                      Phiếu trắng
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Ý kiến chuyên môn đã ghi nhận:
                  </span>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs italic text-slate-700">
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
