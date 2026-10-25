import { Edit3, Eye, MapPin, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Heritage, HeritageStatus } from '../../types/heritage';

const statuses: Array<HeritageStatus | 'ALL'> = [
  'ALL',
  'DRAFT' as HeritageStatus,
  'SUBMITTED' as HeritageStatus,
  'UNDER_REVIEW' as HeritageStatus,
  'VERIFIED' as HeritageStatus,
  'REJECTED' as HeritageStatus,
  'PUBLISHED' as HeritageStatus,
];

const statusLabels: Record<HeritageStatus | 'ALL', string> = {
  ALL: 'Tất cả trạng thái',
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Đã gửi duyệt',
  UNDER_REVIEW: 'Đang kiểm duyệt',
  VERIFIED: 'Đã xác thực',
  REJECTED: 'Bị từ chối',
  PUBLISHED: 'Đã xuất bản (Blockchain)',
};

// Map màu Badge theo chuẩn VNFAM Dark Theme
const statusStyles: Record<HeritageStatus, string> = {
  DRAFT: 'bg-stone-800 border-stone-700 text-stone-400',
  SUBMITTED: 'bg-amber-950/80 border-amber-800 text-amber-300',
  UNDER_REVIEW: 'bg-blue-950/80 border-blue-800 text-blue-300',
  VERIFIED: 'bg-teal-950/80 border-teal-800 text-teal-300',
  REJECTED: 'bg-red-950/80 border-red-800 text-red-400',
  PUBLISHED: 'bg-[#A50C1E]/30 border-[#A50C1E]/60 text-amber-300',
};

interface HeritageListProps {
  heritages: Heritage[];
  loading: boolean;
  status: HeritageStatus | 'ALL';
  search: string;
  onStatusChange: (status: HeritageStatus | 'ALL') => void;
  onSearchChange: (search: string) => void;
  onSearchSubmit: () => void;
  onEdit: (heritage: Heritage) => void;
  onSubmitForReview: (id: string) => void;
  onRemove: (id: string) => void;
}

export function HeritageList({
  heritages,
  loading,
  status,
  search,
  onStatusChange,
  onSearchChange,
  onSearchSubmit,
  onEdit,
  onSubmitForReview,
  onRemove,
}: HeritageListProps) {
  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/90 shadow-2xl overflow-hidden text-stone-100">

      {/* Thanh Bộ lọc & Tìm kiếm */}
      <div className="grid gap-3 border-b border-stone-800 bg-stone-950/60 p-4 md:grid-cols-[200px_1fr_auto]">
        <select
          className="rounded-lg border border-stone-700 bg-stone-800/80 px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-[#A50C1E] cursor-pointer"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as HeritageStatus | 'ALL')}
        >
          {statuses.map((item) => (
            <option key={item} value={item} className="bg-stone-900 text-white">
              {statusLabels[item]}
            </option>
          ))}
        </select>

        <input
          className="rounded-lg border border-stone-700 bg-stone-800/80 px-3 py-2 text-xs sm:text-sm text-white placeholder-stone-500 outline-none focus:border-[#A50C1E]"
          placeholder="Tìm theo tên hoặc mã hồ sơ di sản..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
        />

        <button
          className="rounded-lg bg-[#A50C1E] border border-amber-400/30 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-800 cursor-pointer shadow-md"
          onClick={onSearchSubmit}
          type="button"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Danh sách Hồ sơ */}
      <div className="divide-y divide-stone-800/80">
        {loading && (
          <p className="p-6 text-center text-xs text-stone-400">Đang tải danh sách hồ sơ di sản...</p>
        )}

        {!loading && heritages.length === 0 && (
          <p className="p-6 text-center text-xs text-stone-400">Không tìm thấy hồ sơ di sản nào trong hệ thống.</p>
        )}

        {!loading &&
          heritages.map((heritage) => (
            <article key={heritage.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] hover:bg-stone-800/30 transition-colors">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3
                    className="font-bold text-white text-base"
                    style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                  >
                    {heritage.name}
                  </h3>

                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[heritage.status] || 'bg-stone-800 border-stone-700 text-stone-300'}`}>
                    {statusLabels[heritage.status] || heritage.status}
                  </span>

                  {heritage.recognizedAt && (
                    <span className="rounded-md bg-stone-800 border border-stone-700 px-2 py-0.5 text-[11px] text-stone-300 font-mono">
                      Công nhận: {new Date(heritage.recognizedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-stone-400">
                  Mã hồ sơ: <span className="font-mono text-amber-300 font-semibold">{heritage.heritageCode}</span> ·{' '}
                  <span className="text-stone-300">{heritage.field?.name || 'Loại hình chưa phân loại'}</span>
                </p>

                {/* Render danh sách Địa điểm */}
                {Boolean(heritage.location?.length) && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-400">
                    <MapPin size={13} className="text-[#A50C1E] shrink-0" />
                    <span>
                      {heritage.location
                        ?.map((loc) => [loc.ward, loc.district, loc.province].filter(Boolean).join(', '))
                        .join(' | ')}
                    </span>
                  </div>
                )}

                <p className="mt-2 line-clamp-2 text-xs text-stone-400 leading-relaxed">{heritage.description}</p>

                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
                  <span>Nguồn: <strong className="text-stone-300">{heritage.source}</strong> ({heritage.sourceOrganization})</span>
                  {heritage.sourceDocumentNumber && <span>Căn cứ số: <strong className="text-stone-300">{heritage.sourceDocumentNumber}</strong></span>}
                  {heritage.sourceDocumentCid && (
                    <span className="font-mono text-amber-400">CID: {heritage.sourceDocumentCid.slice(0, 12)}...</span>
                  )}
                </div>
              </div>

              {/* Các thao tác tác vụ */}
              <div className="flex flex-wrap items-start gap-2">
                <Link
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-700 hover:text-white transition-all"
                  to={`/heritages/${heritage.id}`}
                >
                  <Eye size={13} /> Xem
                </Link>

                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-700 hover:text-white transition-all cursor-pointer"
                  onClick={() => onEdit(heritage)}
                  type="button"
                >
                  <Edit3 size={13} /> Sửa
                </button>

                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-[#A50C1E] hover:border-[#A50C1E] hover:text-white transition-all cursor-pointer"
                  onClick={() => onSubmitForReview(heritage.id)}
                  type="button"
                >
                  <Send size={13} /> Gửi duyệt
                </button>

                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900 hover:text-white transition-all cursor-pointer"
                  onClick={() => onRemove(heritage.id)}
                  type="button"
                >
                  <Trash2 size={13} /> Xóa
                </button>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}
