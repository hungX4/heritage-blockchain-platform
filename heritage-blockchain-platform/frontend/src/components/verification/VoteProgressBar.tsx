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
    <div className="space-y-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3.5">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-emerald-800">Đồng ý: {approved}</span>
        <span className="text-slate-700">Trắng: {abstained}</span>
        <span className="text-rose-800">Từ chối: {rejected}</span>
        <span className="text-stone-400">Chờ: {pending}</span>
      </div>

      {/* Thanh phần trăm */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div style={{ width: `${(approved / total) * 100}%` }} className="bg-emerald-700" title="Đồng ý" />
        <div style={{ width: `${(abstained / total) * 100}%` }} className="bg-slate-500" title="Phiếu trắng" />
        <div style={{ width: `${(rejected / total) * 100}%` }} className="bg-rose-700" title="Từ chối" />
      </div>

      <p className="mt-1 text-center text-[11px] text-slate-500 font-medium">
        Hoàn thành: <strong className="text-slate-800">{approved + rejected + abstained}/{total}</strong> đánh giá
      </p>
    </div>
  );
}
