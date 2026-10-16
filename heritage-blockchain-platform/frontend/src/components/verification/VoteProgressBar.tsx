import type { Verification } from '../../api/verification.api';

interface VoteProgressBarProps {
  verifications: Verification[];
}

export function VoteProgressBar({ verifications }: VoteProgressBarProps) {
  const total = verifications.length || 1;
  const approved = verifications.filter((v) => v.status === 'APPROVED').length;
  const rejected = verifications.filter((v) => v.status === 'REJECTED').length;
  const abstained = verifications.filter((v) => v.status === 'ABSTAINED').length;
  const pending = total - (approved + rejected + abstained);

  return (
    <div className="space-y-2 rounded border border-stone-200 bg-stone-50 p-3">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-emerald-700">Đồng ý: {approved}</span>
        <span className="text-slate-700">Trắng: {abstained}</span>
        <span className="text-red-700">Từ chối: {rejected}</span>
        <span className="text-slate-400">Chờ: {pending}</span>
      </div>

      {/* Thanh phần trăm kết quả biểu quyết */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-stone-200">
        <div style={{ width: `${(approved / total) * 100}%` }} className="bg-emerald-600" title="Đồng ý" />
        <div style={{ width: `${(abstained / total) * 100}%` }} className="bg-slate-500" title="Phiếu trắng" />
        <div style={{ width: `${(rejected / total) * 100}%` }} className="bg-red-500" title="Từ chối" />
      </div>

      <p className="mt-1 text-center text-xs text-slate-500">
        Tiến độ: {approved + rejected + abstained}/{total} chuyên gia đã hoàn thành đánh giá.
      </p>
    </div>
  );
}
