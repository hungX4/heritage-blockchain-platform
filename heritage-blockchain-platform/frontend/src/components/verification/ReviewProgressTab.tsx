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
  const [adminFilter, setAdminFilter] = useState<AdminFilterType>('ALL');
  const [expertCounts, setExpertCounts] = useState<Record<string, number>>({});

  const submittedCount = heritages.filter((h) => h.status === 'SUBMITTED').length;
  const underReviewCount = heritages.filter((h) => h.status === 'UNDER_REVIEW').length;
  const completedCount = heritages.filter((h) => ['VERIFIED', 'REJECTED'].includes(h.status)).length;

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
      [id]: Math.max(1, value),
    }));
  };

  return (
    <div className="space-y-4">
      {/* THANH BỘ LỌC PHÂN LOẠI */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setAdminFilter('ALL')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${adminFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <ListFilter size={14} />
          Tất cả ({heritages.length})
        </button>

        <button
          type="button"
          onClick={() => setAdminFilter('SUBMITTED')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${adminFilter === 'SUBMITTED'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <UserPlus size={14} />
          Chờ gán chuyên gia ({submittedCount})
        </button>

        <button
          type="button"
          onClick={() => setAdminFilter('UNDER_REVIEW')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${adminFilter === 'UNDER_REVIEW'
              ? 'bg-sky-100 text-sky-900 border border-sky-300'
              : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <Clock size={14} />
          Đang thẩm định ({underReviewCount})
        </button>

        <button
          type="button"
          onClick={() => setAdminFilter('COMPLETED')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${adminFilter === 'COMPLETED'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
          <CheckCheck size={14} />
          Đã hoàn thành ({completedCount})
        </button>
      </div>

      {/* DANH SÁCH & BẢNG TIẾN ĐỘ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Danh sách hồ sơ */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase text-slate-600 tracking-wider">Danh sách hồ sơ di sản</h2>
          {filteredHeritages.length === 0 && (
            <p className="rounded-xl border border-stone-200 bg-white p-6 text-xs text-slate-500">
              Không tìm thấy hồ sơ nào phù hợp với bộ lọc.
            </p>
          )}

          {filteredHeritages.map((heritage) => {
            const count = getExpertCountForHeritage(heritage.id);

            return (
              <div
                key={heritage.id}
                className={`cursor-pointer rounded-xl border p-4 bg-white transition-all shadow-xs ${selectedHeritageId === heritage.id
                    ? 'border-[#A50C1E] ring-2 ring-[#A50C1E]/20'
                    : 'border-stone-200 hover:border-stone-300'
                  }`}
                onClick={() => onSelectHeritage(heritage.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className="font-bold text-slate-900 text-sm"
                    style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                  >
                    {heritage.name}
                  </h3>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${HERITAGE_STATUS_LABELS[heritage.status]?.color || 'bg-stone-100 text-slate-600'
                      }`}
                  >
                    {HERITAGE_STATUS_LABELS[heritage.status]?.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-mono">Mã: {heritage.heritageCode}</p>

                {/* Phân công chuyên gia */}
                {heritage.status === 'SUBMITTED' && (
                  <div
                    className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs text-slate-600 font-semibold">Số chuyên gia:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      className="w-14 rounded-lg border border-stone-300 px-2 py-1 text-xs text-center font-bold outline-none focus:border-[#A50C1E]"
                      value={count}
                      onChange={(e) => handleCountChange(heritage.id, parseInt(e.target.value) || 1)}
                    />
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#A50C1E] px-3 py-1 text-xs font-bold text-white hover:bg-red-800 transition-colors cursor-pointer shadow-xs"
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

        {/* Bảng chi tiết tiến độ biểu quyết */}
        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 self-start sticky top-24 shadow-xs">
          <h2
            className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            <ShieldAlert size={18} className="text-[#A50C1E]" /> Tiến Độ Biểu Quyết
          </h2>

          {!selectedHeritageId && (
            <p className="text-xs text-slate-500 italic">Vui lòng chọn một hồ sơ ở danh sách bên trái để xem tiến độ chi tiết.</p>
          )}

          {selectedHeritageId && (
            <>
              <VoteProgressBar verifications={selectedVerifications} />

              <div className="mt-4 divide-y divide-stone-100">
                <p className="pb-2 text-[11px] font-bold uppercase text-slate-500">Danh sách phiếu bầu hội đồng</p>
                {selectedVerifications.length === 0 ? (
                  <p className="py-3 text-xs text-slate-400 italic">Chưa có chuyên gia nào được gán cho hồ sơ này.</p>
                ) : (
                  selectedVerifications.map((v, index) => {
                    const badge = VOTE_STATUS_BADGES[v.status] || VOTE_STATUS_BADGES.PENDING;
                    return (
                      <div key={v.id} className="flex items-start justify-between py-2.5 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">Chuyên gia #{index + 1}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{v.notes || 'Chưa có ghi chú'}</p>
                        </div>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.color}`}>{badge.label}</span>
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
