import { Edit3, Plus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { heritagePayloadSchema } from '../../types/heritage';
import type { HeritagePayload, LocationItem } from '../../types/heritage';
import { MediaUploader } from './MediaUploader';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { mediaApi } from '../../api/media.api';

interface OptionItem {
  id: string;
  name: string;
}

interface HeritageFormProps {
  initialData?: HeritagePayload | null;
  categories?: OptionItem[];
  organizations?: OptionItem[];
  onSubmit: (data: HeritagePayload) => Promise<void>;
  onCancel?: () => void;
}

const emptyForm: HeritagePayload = {
  heritageCode: '',
  name: '',
  description: '',
  category: '',
  location: [],
  source: '',
  sourceOrganization: '',
  recognizedAt: '',
  sourceDocumentNumber: '',
  sourceUrl: '',
  sourceDocumentCid: '',
  media: []
};

export function HeritageForm({
  initialData,
  categories = [],
  organizations = [],
  onSubmit,
  onCancel,
}: HeritageFormProps) {
  const [form, setForm] = useState<HeritagePayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const isEditing = Boolean(initialData);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [tempLoc, setTempLoc] = useState<LocationItem>({ province: '', district: '', ward: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        location: initialData.location || [], // Phòng thủ nếu null
        media: initialData.media || [],
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialData]);

  const handleAddLocation = () => {
    if (!tempLoc.province.trim()) return;

    const newItem: LocationItem = {
      province: tempLoc.province.trim(),
      ...(tempLoc.district?.trim() && { district: tempLoc.district.trim() }),
      ...(tempLoc.ward?.trim() && { ward: tempLoc.ward.trim() }),
    };

    setForm((prev) => ({ ...prev, location: [...(prev.location || []), newItem] }));
    setTempLoc({ province: '', district: '', ward: '' });
    if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
  };

  const handleRemoveLocation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      location: (prev.location || []).filter((_, i) => i !== index),
    }));
  };

  const handleUploadLegalDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      // 🟢 Gọi qua API module gọn gàng
      const res = await mediaApi.uploadLegalDocument(file);
      const { url, cid } = res.data;

      // Tự động điền URL và IPFS CID vào Form State
      setForm((prev) => ({
        ...prev,
        sourceUrl: url,
        sourceDocumentCid: cid,
      }));
      toast.success('Đã tải lên văn bản pháp lý & khởi tạo CID IPFS thành công!');
    } catch {
      toast.error('Lỗi khi tải văn bản pháp lý');
    } finally {
      setUploadingDoc(false);
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationResult = heritagePayloadSchema.safeParse(form);

    if (!validationResult.success) {
      setErrors(validationResult.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(validationResult.data);

    if (!isEditing) {
      setForm(emptyForm);
    }
  };

  return (
    <form className="rounded border border-stone-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
        {isEditing ? <Edit3 size={18} className="text-emerald-700" /> : <Plus size={18} className="text-emerald-700" />}
        <h2 className="text-base font-semibold text-slate-900">{isEditing ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ mới'}</h2>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Mã hồ sơ *" value={form.heritageCode} error={errors.heritageCode?.[0]} onChange={(val) => setForm({ ...form, heritageCode: val })} />
        <Field label="Tên di sản *" value={form.name} error={errors.name?.[0]} onChange={(val) => setForm({ ...form, name: val })} />

        {/* Chọn Loại hình di sản (Map vào category) */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Loại hình di sản *</span>
          <select
            className={`mt-1 w-full rounded border px-3 py-2 text-sm outline-none transition-colors ${errors.category ? 'border-red-500' : 'border-stone-300 focus:border-emerald-700'
              }`}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">-- Chọn loại hình di sản --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category[0]}</p>}
        </label>

        {/* Ngày ghi danh */}
        <Field
          label="Thời điểm ghi danh / công nhận"
          type="date"
          value={form.recognizedAt || ''}
          error={errors.recognizedAt?.[0]}
          onChange={(val) => setForm({ ...form, recognizedAt: val })}
        />

        {/* Danh sách Địa điểm */}
        <div className="md:col-span-2 rounded border border-stone-200 bg-stone-50 p-3">
          <span className="text-sm font-medium text-slate-700">Danh sách địa điểm *</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              placeholder="Tỉnh/Thành phố *"
              className="rounded border border-stone-300 px-2 py-1 text-sm outline-none focus:border-emerald-700"
              value={tempLoc.province}
              onChange={(e) => setTempLoc({ ...tempLoc, province: e.target.value })}
            />
            <input
              placeholder="Quận/Huyện"
              className="rounded border border-stone-300 px-2 py-1 text-sm outline-none focus:border-emerald-700"
              value={tempLoc.district || ''}
              onChange={(e) => setTempLoc({ ...tempLoc, district: e.target.value })}
            />
            <input
              placeholder="Phường/Xã"
              className="rounded border border-stone-300 px-2 py-1 text-sm outline-none focus:border-emerald-700"
              value={tempLoc.ward || ''}
              onChange={(e) => setTempLoc({ ...tempLoc, ward: e.target.value })}
            />
            <button
              type="button"
              className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
              onClick={handleAddLocation}
            >
              + Thêm địa điểm
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {form.location?.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-medium text-slate-800 border border-stone-300">
                {item.province}
                {item.district && ` > ${item.district}`}
                {item.ward && ` > ${item.ward}`}
                <button type="button" onClick={() => handleRemoveLocation(index)} className="ml-1 text-red-500 hover:text-red-700">
                  ×
                </button>
              </span>
            ))}
          </div>
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location[0]}</p>}
        </div>

        <Field label="Nguồn dữ liệu *" value={form.source} error={errors.source?.[0]} onChange={(val) => setForm({ ...form, source: val })} />

        {/* Chọn Tổ chức nguồn */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tổ chức nguồn *</span>
          <select
            className={`mt-1 w-full rounded border px-3 py-2 text-sm outline-none transition-colors ${errors.sourceOrganization ? 'border-red-500' : 'border-stone-300 focus:border-emerald-700'
              }`}
            value={form.sourceOrganization}
            onChange={(e) => setForm({ ...form, sourceOrganization: e.target.value })}
          >
            <option value="">-- Chọn tổ chức --</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.name}>
                {org.name}
              </option>
            ))}
          </select>
          {errors.sourceOrganization && <p className="mt-1 text-xs text-red-600">{errors.sourceOrganization[0]}</p>}
        </label>

        <Field label="Số hiệu quyết định / căn cứ" value={form.sourceDocumentNumber || ''} onChange={(val) => setForm({ ...form, sourceDocumentNumber: val })} />
        <Field label="Đường dẫn tham khảo (URL)" value={form.sourceUrl || ''} onChange={(val) => setForm({ ...form, sourceUrl: val })} />
        <div className="md:col-span-2 rounded border border-stone-200 bg-stone-50 p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <div>
              <span className="text-sm font-medium text-slate-800">Văn bản / Quyết định pháp lý đính kèm</span>
              <p className="text-[11px] text-stone-500">Tải file PDF quyết định hoặc dán trực tiếp mã CID IPFS nếu đã có</p>
            </div>
            <label className="cursor-pointer rounded bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800 transition-colors">
              {uploadingDoc ? 'Đang upload lên IPFS...' : '+ Tải file PDF quyết định'}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUploadLegalDoc} disabled={uploadingDoc} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Ô CID: Cho phép tự gõ/dán tay, tự sync URL Gateway nếu gõ tay */}
            <Field
              label="Mã IPFS CID (PDF Quyết định)"
              value={form.sourceDocumentCid || ''}
              error={errors.sourceDocumentCid?.[0]}
              onChange={(cid) => {
                const cleanCid = cid.trim();
                setForm({
                  ...form,
                  sourceDocumentCid: cleanCid,
                  // Tự sinh URL gateway nếu người dùng dán tay CID
                  sourceUrl: cleanCid ? `https://gateway.pinata.cloud/ipfs/${cleanCid}` : form.sourceUrl
                });
              }}
            />

            {/* Ô URL: Tự điền khi upload/dán CID, nhưng vẫn cho phép chỉnh sửa nếu muốn link khác */}
            <Field
              label="Đường dẫn xem văn bản (URL)"
              value={form.sourceUrl || ''}
              onChange={(val) => setForm({ ...form, sourceUrl: val })}
            />
          </div>
        </div>

        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Mô tả *</span>
          <textarea
            className={`mt-1 min-h-24 w-full rounded border px-3 py-2 text-sm outline-none transition-colors ${errors.description ? 'border-red-500' : 'border-stone-300 focus:border-emerald-700'
              }`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description[0]}</p>}
        </label>
      </div>

      <div className="md:col-span-2">
        <MediaUploader
          mediaList={form.media || []}
          onChange={(newList) => setForm({ ...form, media: newList })}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors" type="submit">
          {isEditing ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
        </button>
        {isEditing && (
          <button className="rounded border border-stone-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 transition-colors" onClick={onCancel} type="button">
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, value, error, type = 'text', onChange }: { label: string; value: string; error?: string; type?: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        className={`mt-1 w-full rounded border px-3 py-2 text-sm outline-none transition-colors ${error ? 'border-red-500' : 'border-stone-300 focus:border-emerald-700'
          }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}
