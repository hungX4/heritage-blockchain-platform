import { ArrowLeft, CheckCircle2, Fingerprint, Hash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { heritageApi } from '../services/heritage.api';
import { heritageVersionApi } from '../services/heritage-version.api';
import type { Heritage, HeritageStatus, HeritageVersion } from '../types/heritage';

const statusLabels: Record<HeritageStatus, string> = {
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Đã gửi',
  UNDER_REVIEW: 'Đang duyệt',
  VERIFIED: 'Đã xác thực',
  REJECTED: 'Từ chối',
  PUBLISHED: 'Công khai'
};

export function HeritageDetailPage() {
  const { id } = useParams();
  const [heritage, setHeritage] = useState<Heritage | null>(null);
  const [versions, setVersions] = useState<HeritageVersion[]>([]);
  const [message, setMessage] = useState('');

  const loadHeritage = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      const [heritageResponse, versionsResponse] = await Promise.all([
        heritageApi.detail(id),
        heritageVersionApi.listByHeritage(id)
      ]);

      setHeritage(heritageResponse.data.data);
      setVersions(versionsResponse.data.data);
    } catch {
      setMessage('Không thể tải chi tiết hồ sơ di sản.');
    }
  }, [id]);

  useEffect(() => {
    void loadHeritage();
  }, [loadHeritage]);

  async function updateStatus(status: HeritageStatus) {
    if (!id) {
      return;
    }

    try {
      const response = await heritageApi.updateStatus(id, status);
      setHeritage(response.data.data);
      setMessage('Đã cập nhật trạng thái hồ sơ.');
    } catch {
      setMessage('Không thể cập nhật trạng thái hồ sơ.');
    }
  }

  async function createVersionHash() {
    if (!id) {
      return;
    }

    try {
      const response = await heritageVersionApi.createForHeritage(id);
      setVersions((current) => [response.data.data, ...current]);
      setMessage('Đã tạo phiên bản và dataHash cho hồ sơ.');
    } catch {
      setMessage('Chỉ hồ sơ VERIFIED hoặc PUBLISHED mới có thể tạo version/hash.');
    }
  }

  if (!heritage) {
    return (
      <section className="space-y-4">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600" to="/heritages">
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
        <p className="text-sm text-slate-600">{message || 'Đang tải chi tiết hồ sơ...'}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600" to="/heritages">
        <ArrowLeft size={16} />
        Quay lại danh sách
      </Link>

      {message && <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}

      <div className="rounded border border-stone-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-emerald-700">{heritage.heritageCode}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{heritage.name}</h1>
            <p className="mt-2 text-slate-600">{heritage.category}</p>
          </div>
          <span className="rounded bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            {statusLabels[heritage.status]}
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Mô tả hồ sơ</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{heritage.description}</p>
          </div>

          <aside className="rounded border border-stone-200 bg-stone-50 p-4">
            <h2 className="text-base font-semibold text-slate-900">Nguồn dữ liệu</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <Info label="Nguồn" value={heritage.source} />
              <Info label="Tổ chức nguồn" value={heritage.sourceOrganization} />
              <Info label="Tài liệu tham chiếu" value={heritage.sourceReference} />
              <Info label="Cập nhật cuối" value={new Date(heritage.updatedAt).toLocaleString()} />
            </dl>
          </aside>
        </div>
      </div>

      <div className="rounded border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-700" />
          <h2 className="text-base font-semibold text-slate-900">Cập nhật trạng thái nghiên cứu</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(statusLabels).map(([value, label]) => (
            <button
              className="rounded border border-stone-300 px-3 py-2 text-sm hover:bg-stone-100"
              key={value}
              onClick={() => void updateStatus(value as HeritageStatus)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded border border-stone-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint size={18} className="text-emerald-700" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Phiên bản và dataHash</h2>
              <p className="mt-1 text-sm text-slate-600">
                Hash SHA-256 được tạo từ dữ liệu hồ sơ đã canonicalize.
              </p>
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={heritage.status !== 'VERIFIED' && heritage.status !== 'PUBLISHED'}
            onClick={() => void createVersionHash()}
            type="button"
          >
            <Hash size={16} />
            Tạo version/hash
          </button>
        </div>

        <div className="divide-y divide-stone-200">
          {versions.length === 0 && (
            <p className="p-5 text-sm text-slate-500">Hồ sơ này chưa có phiên bản/hash nào.</p>
          )}
          {versions.map((version) => (
            <article className="grid gap-3 p-5 lg:grid-cols-[160px_1fr]" key={version.id}>
              <div>
                <p className="text-sm font-semibold text-slate-900">Version {version.version}</p>
                <time className="mt-1 block text-xs text-slate-500">
                  {new Date(version.createdAt).toLocaleString()}
                </time>
              </div>
              <div>
                <p className="break-all rounded bg-stone-50 p-3 font-mono text-xs text-slate-700">
                  {version.dataHash}
                </p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-emerald-800">
                    Xem canonical data
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
                    {JSON.stringify(version.canonicalData, null, 2)}
                  </pre>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-slate-900">{props.label}</dt>
      <dd className="mt-1 text-slate-600">{props.value}</dd>
    </div>
  );
}
