import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit3, Award, Layers, X, Check } from 'lucide-react';
import { masterDataApi, Specialization, HeritageField } from '../../api/masterData.api';
import { useDebounce } from '../../hooks/useDebounce';

export function SpecializationsPage() {
  const [specs, setSpecs] = useState<Specialization[]>([]);
  const [heritageFields, setHeritageFields] = useState<HeritageField[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 400);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [specRes, fieldRes] = await Promise.all([
        masterDataApi.getSpecializations(debouncedSearch),
        masterDataApi.getHeritageFields(),
      ]);
      setSpecs(specRes.data.data);
      setHeritageFields(fieldRes.data.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  // Toggle Checkbox chọn Loại hình di sản
  const toggleFieldSelection = (fieldId: string) => {
    setSelectedFieldIds((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  // Tạo mới Chuyên môn + Gán Loại hình di sản
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await masterDataApi.createSpecialization({ code, name });
      const newSpecId = res.data.data.id;

      if (selectedFieldIds.length > 0 && masterDataApi.syncSpecializationFields) {
        await masterDataApi.syncSpecializationFields(newSpecId, selectedFieldIds);
      }

      setIsCreateModalOpen(false);
      setCode('');
      setName('');
      setSelectedFieldIds([]);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo mới');
    }
  };

  // Mở modal sửa Loại hình di sản cho 1 Chuyên môn
  const openMappingModal = (spec: any) => {
    setSelectedSpec(spec);

    const currentFieldIds =
      spec.fieldMappings?.map(
        (m: any) => m.heritageField?.id || m.heritageFieldId
      ) || [];

    setSelectedFieldIds(currentFieldIds);
    setIsMappingModalOpen(true);
  };

  // Cập nhật liên kết Loại hình di sản
  const handleSaveMapping = async () => {
    if (!selectedSpec) return;
    try {
      if (masterDataApi.syncSpecializationFields) {
        await masterDataApi.syncSpecializationFields(selectedSpec.id, selectedFieldIds);
      }
      setIsMappingModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Không thể cập nhật loại hình di sản');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa chuyên môn này?')) return;
    try {
      await masterDataApi.deleteSpecialization(id);
      fetchData();
    } catch (err) {
      alert('Không thể xóa chuyên môn này');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] font-sans text-slate-800 pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[88px] w-[870px] left-1/2 -translate-x-1/2 bg-[#A50C1E]" />
      {/* ================= PHẦN ĐẦU TRANG: KHỐI ĐỎ CỜ DI SẢN ================= */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-black leading-tight"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Quản Lý Chuyên Môn Chuyên Gia
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
              Danh mục lĩnh vực chuyên sâu và ma trận loại hình di sản thẩm định tương ứng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedFieldIds([]);
              setCode('');
              setName('');
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={16} /> Thêm Chuyên môn
          </button>
        </div>
      </div>

      {/* ================= THÂN TRANG (BACKGROUND CANVAS TRẮNG) ================= */}
      <div className="mx-auto -mt-6 max-w-6xl space-y-5 px-4 sm:px-6 lg:px-8">

        {/* Thanh Tìm Kiếm Đen Trắng */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chuyên môn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-stone-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-stone-400 outline-none focus:border-black transition-colors"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Tổng số: <strong className="text-slate-900">{specs.length}</strong> chuyên môn
          </p>
        </div>

        {/* Bảng Danh sách Chuyên môn */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-stone-200 bg-stone-100 text-[11px] font-bold uppercase text-slate-800">
              <tr>
                <th className="px-6 py-3.5">Mã Chuyên môn</th>
                <th className="px-6 py-3.5">Tên Chuyên môn</th>
                <th className="px-6 py-3.5">Loại hình Di sản áp dụng</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 text-xs">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : specs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 text-xs">
                    Chưa có chuyên môn nào.
                  </td>
                </tr>
              ) : (
                specs.map((item: any) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.code}</td>
                    <td
                      className="px-6 py-4 font-bold text-slate-900 text-sm"
                      style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                    >
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.fieldMappings && item.fieldMappings.length > 0 ? (
                          item.fieldMappings.map((m: any) => {
                            const fieldName = m.heritageField?.name || m.field?.name || m.name;

                            return (
                              <span
                                key={m.id || m.heritageField?.id || m.field?.id}
                                className="rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-slate-800 border border-stone-200 font-mono"
                              >
                                {fieldName || 'Không có tên'}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa chọn loại hình</span>
                        )}
                        <button
                          type="button"
                          onClick={() => openMappingModal(item)}
                          className="ml-1 rounded-md p-1 text-stone-400 hover:bg-stone-200 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Chỉnh sửa loại hình di sản"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-stone-200 bg-white p-2 text-slate-600 hover:bg-stone-100 hover:text-[#A50C1E] transition-colors cursor-pointer"
                        title="Xóa chuyên môn"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL 1: TẠO MỚI CHUYÊN MÔN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Thêm Chuyên Môn Mới
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Mã chuyên môn</label>
                <input
                  required
                  type="text"
                  placeholder="VD: HAN_NOM_STUDIES"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-xs text-slate-800 font-mono outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Tên chuyên môn</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Nghiên cứu Hán Nôm & Di sản văn bản"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-xs text-slate-800 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                  Áp dụng cho các Loại hình Di sản (Tick chọn):
                </label>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-stone-200 p-3 space-y-2 bg-stone-50">
                  {heritageFields.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Không có dữ liệu loại hình di sản</p>
                  ) : (
                    heritageFields.map((field) => {
                      const isChecked = selectedFieldIds.includes(field.id);
                      return (
                        <label
                          key={field.id}
                          className={`flex items-center justify-between rounded-lg p-2 text-xs cursor-pointer border transition-all ${isChecked
                            ? 'border-black bg-white shadow-xs font-bold'
                            : 'border-stone-200 bg-white hover:bg-stone-100 text-slate-700'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <Layers size={14} className={isChecked ? 'text-black' : 'text-stone-400'} />
                            <span className="font-semibold text-slate-800">{field.name}</span>
                            <span className="font-mono text-[10px] text-stone-400">({field.code})</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFieldSelection(field.id)}
                            className="h-4 w-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                >
                  Lưu Chuyên môn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CẬP NHẬT LOẠI HÌNH DI SẢN CHO CHUYÊN MÔN */}
      {isMappingModalOpen && selectedSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Gán Loại Hình Di Sản
              </h2>
              <button
                type="button"
                onClick={() => setIsMappingModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-2">
              Chuyên môn: <strong className="text-slate-900">{selectedSpec.name}</strong>
            </p>

            <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-stone-200 p-3 space-y-2 bg-stone-50">
              {heritageFields.map((field) => {
                const isChecked = selectedFieldIds.includes(field.id);
                return (
                  <label
                    key={field.id}
                    className={`flex items-center justify-between rounded-lg p-2 text-xs cursor-pointer border transition-all ${isChecked
                      ? 'border-black bg-white shadow-xs font-bold'
                      : 'border-stone-200 bg-white hover:bg-stone-100 text-slate-700'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={14} className={isChecked ? 'text-black' : 'text-stone-400'} />
                      <span className="font-semibold text-slate-800">{field.name}</span>
                      <span className="font-mono text-[10px] text-stone-400">({field.code})</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFieldSelection(field.id)}
                      className="h-4 w-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4">
              <button
                type="button"
                onClick={() => setIsMappingModalOpen(false)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveMapping}
                className="flex items-center gap-1.5 rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
              >
                <Check size={15} />
                <span>Cập nhật</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
