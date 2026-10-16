import { useState } from 'react';
import { ClipboardCheck, ShieldAlert, Clock, CheckCheck, ListFilter, UserPlus } from 'lucide-react';
import type { Verification } from '../../api/verification.api';
import { HERITAGE_STATUS_LABELS, VOTE_STATUS_BADGES } from '../../constants/verification.constants';
import type { Heritage } from '../../types/heritage';
import { VoteProgressBar } from './VoteProgressBar';

interface ReviewProgressTabProps {
  heritages: Heritage[];
  selectedHeritageId: string | null;
  selectedVerifications: Verification[];
  onSelectHeritage: (heritageId: string) => void;
  onAutoAssign: (heritageId: string, count: number) => void;
}

type AdminFilterType = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED';

export function ReviewProgressTab({
  heritages,
  selectedHeritageId,
  selectedVerifications,
  onSelectHeritage,
  onAutoAssign,
}: ReviewProgressTabProps) {
  // 🟢 State lọc theo trạng thái hồ sơ
  const [adminFilter, setAdminFilter] = useState<AdminFilterType>('ALL');

  // 🟢 State lưu số lượng chuyên gia muốn gán cho từng hồ sơ (mặc định = 5)
  const [expertCounts, setExpertCounts] = useState<Record<string, number>>({});

  // Đếm số lượng hồ sơ theo từng danh mục
  const submittedCount = heritages.filter((h) => h.status === 'SUBMITTED').length;
  const underReviewCount = heritages.filter((h) => h.status === 'UNDER_REVIEW').length;
  const completedCount = heritages.filter((h) => ['VERIFIED', 'REJECTED'].includes(h.status)).length;

  // Lọc danh sách hồ sơ dựa vào Filter đang chọn
  const filteredHeritages = heritages.filter((heritage) => {
    if (adminFilter === 'SUBMITTED') return heritage.status === 'SUBMITTED';
    if (adminFilter === 'UNDER_REVIEW') return heritage.status === 'UNDER_REVIEW';
    if (adminFilter === 'COMPLETED') return ['VERIFIED', 'REJECTED'].includes(heritage.status);
    return true;
  });

  const getExpertCountForHeritage = (id: string) => expertCounts[id] ?? 3;

  const handleCountChange = (id: string, value: number) => {
    setExpertCounts((prev) => ({
      ...prev,
      [id]: Math.max(1, value), // Tối thiểu là 1
    }));
  };

  return (
    <div className="space-y-4">
      {/* 🟢 THANH BỘ LỌC PHÂN LOẠI HỒ SƠ CHO ADMIN */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setAdminFilter('ALL')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${adminFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <ListFilter size={14} />
          Tất cả ({heritages.length})
        </button>

        <button
          type="button"
          onClick={() => setAdminFilter('SUBMITTED')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${adminFilter === 'SUBMITTED'
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <UserPlus size={14} />
          Chờ gán chuyên gia ({submittedCount})
        </button>

        <button
          type="button"
          onClick={() => setAdminFilter('UNDER_REVIEW')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${adminFilter === 'UNDER_REVIEW'
            ? 'bg-blue-100 text-blue-800 border border-blue-300'
            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <Clock size={14} />
          Đang thẩm định ({underReviewCount})
        </button>

        <button
          type="button"
          onClick={() => setAdminFilter('COMPLETED')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${adminFilter === 'COMPLETED'
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <CheckCheck size={14} />
          Đã hoàn thành ({completedCount})
        </button>
      </div>

      {/* NỘI DUNG CHÍNH: CỘT BÊN TRÁI LÀ DANH SÁCH - CỘT BÊN PHẢI LÀ TIẾN ĐỘ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Cột trái: Danh sách hồ sơ */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase text-slate-700">Danh sách hồ sơ di sản</h2>
          {filteredHeritages.length === 0 && (
            <p className="rounded border bg-white p-4 text-sm text-slate-500">
              Không tìm thấy hồ sơ nào phù hợp với bộ lọc.
            </p>
          )}

          {filteredHeritages.map((heritage) => {
            const count = getExpertCountForHeritage(heritage.id);

            return (
              <div
                key={heritage.id}
                className={`cursor-pointer rounded border p-4 bg-white transition-all ${selectedHeritageId === heritage.id
                  ? 'border-emerald-700 ring-1 ring-emerald-700'
                  : 'border-stone-200 hover:border-stone-300'
                  }`}
                onClick={() => onSelectHeritage(heritage.id)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">{heritage.name}</h3>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${HERITAGE_STATUS_LABELS[heritage.status]?.color
                      }`}
                  >
                    {HERITAGE_STATUS_LABELS[heritage.status]?.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{heritage.heritageCode}</p>

                {/* 🟢 KHU VỰC PHÂN CÔNG CHUYÊN GIA (CHO PHÉP CHỌN SỐ LƯỢNG) */}
                {heritage.status === 'SUBMITTED' && (
                  <div
                    className="mt-3 flex items-center gap-2 pt-2 border-t border-stone-100"
                    onClick={(e) => e.stopPropagation()} // Tránh kích hoạt click chọn card
                  >
                    <span className="text-xs text-slate-600 font-medium">Số lượng chuyên gia:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      className="w-16 rounded border border-stone-300 px-2 py-1 text-xs text-center font-medium outline-none focus:border-emerald-700"
                      value={count}
                      onChange={(e) => handleCountChange(heritage.id, parseInt(e.target.value) || 1)}
                    />
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                      onClick={() => onAutoAssign(heritage.id, count)}
                    >
                      <ClipboardCheck size={14} /> Gán {count} chuyên gia
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cột phải: Bảng chi tiết tiến độ biểu quyết */}
        <div className="space-y-4 rounded border border-stone-200 bg-white p-5 self-start sticky top-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ShieldAlert size={18} className="text-emerald-700" /> Tiến độ Biểu quyết Hội đồng
          </h2>

          {!selectedHeritageId && (
            <p className="text-sm text-slate-500">Vui lòng chọn một hồ sơ ở bên trái để xem tiến độ biểu quyết.</p>
          )}

          {selectedHeritageId && (
            <>
              <VoteProgressBar verifications={selectedVerifications} />

              <div className="mt-4 divide-y divide-stone-100">
                <p className="pb-2 text-xs font-semibold uppercase text-slate-500">Danh sách phiếu bầu chuyên gia</p>
                {selectedVerifications.length === 0 ? (
                  <p className="py-3 text-xs text-slate-400 italic">Chưa có chuyên gia nào được gán cho hồ sơ này.</p>
                ) : (
                  selectedVerifications.map((v, index) => {
                    const badge = VOTE_STATUS_BADGES[v.status] || VOTE_STATUS_BADGES.PENDING;
                    return (
                      <div key={v.id} className="flex items-start justify-between py-3 text-sm">
                        <div>
                          <p className="font-medium text-slate-800">Chuyên gia #{index + 1}</p>
                          <p className="text-xs text-slate-500">{v.notes || 'Chưa có ghi chú'}</p>
                        </div>
                        <span className={`rounded px-2 py-1 text-xs font-medium ${badge.color}`}>{badge.label}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
