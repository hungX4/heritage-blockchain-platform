// src/components/heritage/HeritageList.tsx
import { Edit3, Eye, MapPin, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Heritage, HeritageStatus } from '../../types/heritage';

const statuses: Array<HeritageStatus | 'ALL'> = [
  'ALL',
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'REJECTED',
  'PUBLISHED',
];

const statusLabels: Record<HeritageStatus | 'ALL', string> = {
  ALL: 'Tất cả',
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Đã gửi',
  UNDER_REVIEW: 'Đang duyệt',
  VERIFIED: 'Đã xác thực',
  REJECTED: 'Từ chối',
  PUBLISHED: 'Công khai',
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
    <div className="rounded border border-stone-200 bg-white shadow-sm">
      {/* Bộ lọc & Tìm kiếm */}
      <div className="grid gap-3 border-b border-stone-200 p-4 md:grid-cols-[180px_1fr_auto]">
        <select
          className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-700"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as HeritageStatus | 'ALL')}
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {statusLabels[item]}
            </option>
          ))}
        </select>
        <input
          className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-700"
          placeholder="Tìm theo tên hoặc mã hồ sơ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
        />
        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          onClick={onSearchSubmit}
          type="button"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Danh sách Hồ sơ */}
      <div className="divide-y divide-stone-200">
        {loading && <p className="p-4 text-sm text-slate-500">Đang tải danh sách hồ sơ...</p>}

        {!loading && heritages.length === 0 && (
          <p className="p-4 text-sm text-slate-500">Không tìm thấy hồ sơ di sản nào.</p>
        )}

        {!loading &&
          heritages.map((heritage) => (
            <article key={heritage.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{heritage.name}</h3>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                    {statusLabels[heritage.status] || heritage.status}
                  </span>
                  {heritage.recognizedAt && (
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-slate-600">
                      Ghi danh: {new Date(heritage.recognizedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  Mã: <span className="font-mono text-slate-800">{heritage.heritageCode}</span> ·{' '}
                  {heritage.field?.name || 'Loại hình chưa phân loại'}
                </p>

                {/* Render an toàn mảng Location bằng optional chaining */}
                {Boolean(heritage.location?.length) && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-stone-600">
                    <MapPin size={14} className="text-emerald-700 shrink-0" />
                    <span>
                      {heritage.location
                        ?.map((loc) => [loc.ward, loc.district, loc.province].filter(Boolean).join(', '))
                        .join(' | ')}
                    </span>
                  </div>
                )}

                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{heritage.description}</p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Nguồn: {heritage.source} ({heritage.sourceOrganization})</span>
                  {heritage.sourceDocumentNumber && <span>Căn cứ số: {heritage.sourceDocumentNumber}</span>}
                  {heritage.sourceDocumentCid && (
                    <span className="font-mono text-emerald-700">CID: {heritage.sourceDocumentCid.slice(0, 10)}...</span>
                  )}
                </div>
              </div>

              {/* Thao tác */}
              <div className="flex flex-wrap items-start gap-2">
                <Link
                  className="inline-flex items-center gap-1.5 rounded border border-stone-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-stone-50"
                  to={`/heritages/${heritage.id}`}
                >
                  <Eye size={14} /> Xem
                </Link>
                <button
                  className="inline-flex items-center gap-1.5 rounded border border-stone-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-stone-50"
                  onClick={() => onEdit(heritage)}
                  type="button"
                >
                  <Edit3 size={14} /> Sửa
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded border border-stone-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onSubmitForReview(heritage.id)}
                  type="button"
                >
                  <Send size={14} /> Gửi duyệt
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  onClick={() => onRemove(heritage.id)}
                  type="button"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}
