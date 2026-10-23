import { Edit3, Plus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { heritagePayloadSchema } from '../../types/heritage';
import type { HeritagePayload, LocationItem } from '../../types/heritage';
import { MediaUploader } from './MediaUploader';
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
        location: initialData.location || [],
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
      const res = await mediaApi.uploadLegalDocument(file);
      const { url, cid } = res.data;

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
    <form className="rounded-xl border border-stone-800 bg-stone-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur text-stone-100" onSubmit={handleSubmit}>

      {/* Tiêu đề Form */}
      <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3.5">
        {isEditing ? <Edit3 size={18} className="text-amber-400" /> : <Plus size={18} className="text-[#A50C1E]" />}
        <h2
          className="text-lg font-bold text-white tracking-wide"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          {isEditing ? 'Cập Nhật Hồ Sơ Di Sản' : 'Khai Báo Hồ Sơ Di Sản Mới'}
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Mã hồ sơ *" value={form.heritageCode} error={errors.heritageCode?.[0]} onChange={(val) => setForm({ ...form, heritageCode: val })} />
        <Field label="Tên di sản *" value={form.name} error={errors.name?.[0]} onChange={(val) => setForm({ ...form, name: val })} />

        {/* Chọn Loại hình di sản */}
        <label className="block">
          <span className="text-xs font-semibold text-stone-300">Loại hình di sản *</span>
          <select
            className={`mt-1.5 w-full rounded-lg border bg-stone-800/80 px-3 py-2 text-xs sm:text-sm text-white outline-none transition-all cursor-pointer ${errors.category ? 'border-red-500' : 'border-stone-700 focus:border-[#A50C1E] focus:bg-stone-800'
              }`}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="" className="bg-stone-900 text-stone-400">-- Chọn loại hình di sản --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-stone-900 text-white">
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category[0]}</p>}
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
        <div className="md:col-span-2 rounded-xl border border-stone-800 bg-stone-950/60 p-4 space-y-3">
          <span className="text-xs font-semibold text-stone-300">Danh sách địa điểm di sản *</span>
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Tỉnh/Thành phố *"
              className="rounded-lg border border-stone-700 bg-stone-800/80 px-3 py-1.5 text-xs text-white placeholder-stone-500 outline-none focus:border-[#A50C1E]"
              value={tempLoc.province}
              onChange={(e) => setTempLoc({ ...tempLoc, province: e.target.value })}
            />
            <input
              placeholder="Quận/Huyện"
              className="rounded-lg border border-stone-700 bg-stone-800/80 px-3 py-1.5 text-xs text-white placeholder-stone-500 outline-none focus:border-[#A50C1E]"
              value={tempLoc.district || ''}
              onChange={(e) => setTempLoc({ ...tempLoc, district: e.target.value })}
            />
            <input
              placeholder="Phường/Xã"
              className="rounded-lg border border-stone-700 bg-stone-800/80 px-3 py-1.5 text-xs text-white placeholder-stone-500 outline-none focus:border-[#A50C1E]"
              value={tempLoc.ward || ''}
              onChange={(e) => setTempLoc({ ...tempLoc, ward: e.target.value })}
            />
            <button
              type="button"
              className="rounded-lg border border-stone-700 bg-stone-800 px-3.5 py-1.5 text-xs font-bold text-stone-200 hover:bg-[#A50C1E] hover:text-white hover:border-[#A50C1E] transition-all cursor-pointer"
              onClick={handleAddLocation}
            >
              + Thêm địa điểm
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {form.location?.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 border border-stone-700 px-2.5 py-1 text-xs font-medium text-amber-200 shadow-sm">
                {item.province}
                {item.district && ` > ${item.district}`}
                {item.ward && ` > ${item.ward}`}
                <button type="button" onClick={() => handleRemoveLocation(index)} className="ml-1 text-stone-400 hover:text-red-400 transition-colors">
                  ×
                </button>
              </span>
            ))}
          </div>
          {errors.location && <p className="mt-1 text-xs text-red-400">{errors.location[0]}</p>}
        </div>

        <Field label="Nguồn dữ liệu *" value={form.source} error={errors.source?.[0]} onChange={(val) => setForm({ ...form, source: val })} />

        {/* Chọn Tổ chức nguồn */}
        <label className="block">
          <span className="text-xs font-semibold text-stone-300">Tổ chức nguồn *</span>
          <select
            className={`mt-1.5 w-full rounded-lg border bg-stone-800/80 px-3 py-2 text-xs sm:text-sm text-white outline-none transition-all cursor-pointer ${errors.sourceOrganization ? 'border-red-500' : 'border-stone-700 focus:border-[#A50C1E] focus:bg-stone-800'
              }`}
            value={form.sourceOrganization}
            onChange={(e) => setForm({ ...form, sourceOrganization: e.target.value })}
          >
            <option value="" className="bg-stone-900 text-stone-400">-- Chọn tổ chức --</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.name} className="bg-stone-900 text-white">
                {org.name}
              </option>
            ))}
          </select>
          {errors.sourceOrganization && <p className="mt-1 text-xs text-red-400">{errors.sourceOrganization[0]}</p>}
        </label>

        <Field label="Số hiệu quyết định / căn cứ" value={form.sourceDocumentNumber || ''} onChange={(val) => setForm({ ...form, sourceDocumentNumber: val })} />
        <Field label="Đường dẫn tham khảo (URL)" value={form.sourceUrl || ''} onChange={(val) => setForm({ ...form, sourceUrl: val })} />

        {/* Văn bản pháp lý đính kèm */}
        <div className="md:col-span-2 rounded-xl border border-stone-800 bg-stone-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
            <div>
              <span className="text-xs font-semibold text-stone-200">Văn bản / Quyết định pháp lý đính kèm</span>
              <p className="text-[11px] text-stone-400">Tải file PDF quyết định hoặc dán trực tiếp mã CID IPFS nếu đã có</p>
            </div>
            <label className="cursor-pointer rounded-lg bg-[#A50C1E] border border-amber-400/30 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-800 transition-all shadow-md">
              {uploadingDoc ? 'Đang upload lên IPFS...' : '+ Tải file PDF quyết định'}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUploadLegalDoc} disabled={uploadingDoc} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Mã IPFS CID (PDF Quyết định)"
              value={form.sourceDocumentCid || ''}
              error={errors.sourceDocumentCid?.[0]}
              onChange={(cid) => {
                const cleanCid = cid.trim();
                setForm({
                  ...form,
                  sourceDocumentCid: cleanCid,
                  sourceUrl: cleanCid ? `https://gateway.pinata.cloud/ipfs/${cleanCid}` : form.sourceUrl
                });
              }}
            />

            <Field
              label="Đường dẫn xem văn bản (URL)"
              value={form.sourceUrl || ''}
              onChange={(val) => setForm({ ...form, sourceUrl: val })}
            />
          </div>
        </div>

        {/* Mô tả */}
        <label className="md:col-span-2">
          <span className="text-xs font-semibold text-stone-300">Mô tả chi tiết *</span>
          <textarea
            className={`mt-1.5 min-h-24 w-full rounded-lg border bg-stone-800/80 p-3 text-xs sm:text-sm text-white placeholder-stone-500 outline-none transition-all ${errors.description ? 'border-red-500' : 'border-stone-700 focus:border-[#A50C1E] focus:bg-stone-800'
              }`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description[0]}</p>}
        </label>
      </div>

      <div className="md:col-span-2 mt-4">
        <MediaUploader
          mediaList={form.media || []}
          onChange={(newList) => setForm({ ...form, media: newList })}
        />
      </div>

      {/* Nút hành động */}
      <div className="mt-6 flex gap-3 pt-3 border-t border-stone-800">
        <button
          className="rounded-lg bg-[#A50C1E] border border-amber-400/30 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-red-800 transition-all cursor-pointer"
          type="submit"
        >
          {isEditing ? 'Lưu thay đổi' : 'Khởi tạo hồ sơ'}
        </button>
        {isEditing && (
          <button
            className="rounded-lg border border-stone-700 bg-stone-800 px-5 py-2.5 text-xs font-bold text-stone-300 hover:bg-stone-700 hover:text-white transition-all cursor-pointer"
            onClick={onCancel}
            type="button"
          >
            Hủy bỏ
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, value, error, type = 'text', onChange }: { label: string; value: string; error?: string; type?: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-stone-300">
        {label}
      </span>
      <input
        type={type}
        className={`mt-1.5 w-full rounded-lg border bg-stone-800/80 px-3 py-2 text-xs sm:text-sm text-white outline-none transition-all ${error ? 'border-red-500' : 'border-stone-700 focus:border-[#A50C1E] focus:bg-stone-800'
          }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  );
}
