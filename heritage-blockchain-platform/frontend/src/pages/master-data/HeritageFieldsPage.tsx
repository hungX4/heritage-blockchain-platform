//Cho phép: Tạo Loại hình di sản + tick chọn Chuyên môn liên quan ngay lúc tạo
//đồng thời sửa danh sách Chuyên môn trực tiếp bằng Modal Tick-select trong bảng danh sách.

import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit3, Layers, Award, X, Check } from 'lucide-react';
import { masterDataApi, HeritageField, Specialization } from '../../api/masterData.api';
import { useDebounce } from '../../hooks/useDebounce';

export function HeritageFieldsPage() {
  const [fields, setFields] = useState<HeritageField[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<HeritageField | null>(null);

  // Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');
  const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 600);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fieldRes, specRes] = await Promise.all([
        masterDataApi.getHeritageFields(search),
        masterDataApi.getSpecializations(),
      ]);
      setFields(fieldRes.data.data);
      setSpecializations(specRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  // Toggle Checkbox Chuyên môn
  const toggleSpecSelection = (specId: string) => {
    setSelectedSpecIds((prev) =>
      prev.includes(specId) ? prev.filter((id) => id !== specId) : [...prev, specId]
    );
  };

  // Tạo mới Loại hình + Gán Chuyên môn
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Tạo Field
      const res = await masterDataApi.createHeritageField({ code: newCode, name: newName });
      const newFieldId = res.data.data.id;

      // 2. Nếu có tick chọn Chuyên môn -> Sync mapping
      if (selectedSpecIds.length > 0) {
        await masterDataApi.syncFieldSpecializations(newFieldId, selectedSpecIds);
      }

      setIsCreateModalOpen(false);
      setNewCode('');
      setNewName('');
      setSelectedSpecIds([]);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Mở modal sửa Chuyên môn cho 1 Loại hình
  const openMappingModal = (field: HeritageField) => {
    setSelectedField(field);
    const currentSpecIds = field.specializationMappings?.map((m) => m.specialization.id) || [];
    setSelectedSpecIds(currentSpecIds);
    setIsMappingModalOpen(true);
  };

  // Lưu Chuyên môn đã tick chọn
  const handleSaveMapping = async () => {
    if (!selectedField) return;
    try {
      await masterDataApi.syncFieldSpecializations(selectedField.id, selectedSpecIds);
      setIsMappingModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Không thể cập nhật chuyên môn');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa loại hình di sản này?')) return;
    try {
      await masterDataApi.deleteHeritageField(id);
      fetchData();
    } catch (err: any) {
      alert('Không thể xóa loại hình này');
    }
  };

  const openEditModal = (field: HeritageField) => {
    setSelectedField(field);
    setEditName(field.name);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedField) return;
    try {
      await masterDataApi.updateHeritageField(selectedField.id, { name: editName.trim() });
      setIsEditModalOpen(false);
      setSelectedField(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật lĩnh vực di sản');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] font-sans text-slate-800 pb-16">

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[88px] w-[870px] left-1/2 -translate-x-1/2 bg-black" />
      {/* ================= PHẦN ĐẦU TRANG: KHỐI ĐỎ CỜ DI SẢN ================= */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>

            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-black leading-tight"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Quản Lý Loại Hình Di Sản
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
              Cấu hình loại hình di sản văn hóa và thiết lập ma trận chuyên môn thẩm định liên quan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedSpecIds([]);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={16} /> Thêm Loại hình
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
              placeholder="Tìm kiếm mã hoặc tên loại hình..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-stone-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-stone-400 outline-none focus:border-black transition-colors"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Tổng số: <strong className="text-slate-900">{fields.length}</strong> loại hình
          </p>
        </div>

        {/* Bảng Danh sách Loại hình Di sản */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-stone-200 bg-stone-100 text-[11px] font-bold uppercase text-slate-800">
              <tr>
                <th className="px-6 py-3.5">Mã Loại hình</th>
                <th className="px-6 py-3.5">Tên Loại hình</th>
                <th className="px-6 py-3.5">Chuyên môn thẩm định yêu cầu</th>
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
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 text-xs">
                    Chưa có dữ liệu loại hình di sản nào.
                  </td>
                </tr>
              ) : (
                fields.map((field) => (
                  <tr key={field.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">{field.code}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-slate-900 text-sm"
                          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                        >
                          {field.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditModal(field)}
                          className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Sửa tên lĩnh vực"
                          aria-label={`Sửa ${field.name}`}
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {field.specializationMappings && field.specializationMappings.length > 0 ? (
                          field.specializationMappings.map((m) => (
                            <span
                              key={m.id}
                              className="rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-slate-800 border border-stone-200 font-mono"
                            >
                              {m.specialization.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa gán chuyên môn</span>
                        )}
                        <button
                          type="button"
                          onClick={() => openMappingModal(field)}
                          className="ml-1 rounded-md p-1 text-stone-400 hover:bg-stone-200 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Sửa chuyên môn"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(field.id)}
                        className="rounded-lg border border-stone-200 bg-white p-2 text-slate-600 hover:bg-stone-100 hover:text-[#A50C1E] transition-colors cursor-pointer"
                        title="Xóa loại hình"
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

      {/* MODAL 1: TẠO MỚI LOẠI HÌNH */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Thêm Loại Hình Di Sản Mới
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Mã loại hình</label>
                <input
                  required
                  type="text"
                  placeholder="VD: INTANGIBLE_HERITAGE"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-xs text-slate-800 font-mono outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Tên loại hình</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Di sản văn hóa phi vật thể"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-xs text-slate-800 outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Tick chọn Chuyên môn */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                  Gán Chuyên môn thẩm định (Tick chọn):
                </label>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-stone-200 p-3 space-y-2 bg-stone-50">
                  {specializations.map((spec) => {
                    const isChecked = selectedSpecIds.includes(spec.id);
                    return (
                      <label
                        key={spec.id}
                        className={`flex items-center justify-between rounded-lg p-2 text-xs cursor-pointer border transition-all ${isChecked
                          ? 'border-black bg-white shadow-xs font-bold'
                          : 'border-stone-200 bg-white hover:bg-stone-100 text-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Award size={14} className={isChecked ? 'text-black' : 'text-stone-400'} />
                          <span className="font-semibold text-slate-800">{spec.name}</span>
                          <span className="font-mono text-[10px] text-stone-400">({spec.code})</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSpecSelection(spec.id)}
                          className="h-4 w-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                        />
                      </label>
                    );
                  })}
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
                  Lưu Loại hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT TÊN LOẠI HÌNH */}
      {isEditModalOpen && selectedField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <form onSubmit={handleUpdate} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-slate-800">
            <h2
              className="text-base font-bold text-slate-900"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Cập Nhật Loại Hình Di Sản
            </h2>
            <p className="mt-1 text-xs text-slate-500 font-mono">Mã loại hình: {selectedField.code}</p>

            <div className="mt-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase" htmlFor="heritage-field-name">
                Tên loại hình mới
              </label>
              <input
                id="heritage-field-name"
                required
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-xs text-slate-800 outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!editName.trim()}
                className="rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: SỬA TICK-SELECT MAPPING */}
      {isMappingModalOpen && selectedField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Cập Nhật Chuyên Môn
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
              Loại hình: <strong className="text-slate-900">{selectedField.name}</strong>
            </p>

            <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-stone-200 p-3 space-y-2 bg-stone-50">
              {specializations.map((spec) => {
                const isChecked = selectedSpecIds.includes(spec.id);
                return (
                  <label
                    key={spec.id}
                    className={`flex items-center justify-between rounded-lg p-2 text-xs cursor-pointer border transition-all ${isChecked
                      ? 'border-black bg-white shadow-xs font-bold'
                      : 'border-stone-200 bg-white hover:bg-stone-100 text-slate-700'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Award size={14} className={isChecked ? 'text-black' : 'text-stone-400'} />
                      <span className="font-semibold text-slate-800">{spec.name}</span>
                      <span className="font-mono text-[10px] text-stone-400">({spec.code})</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSpecSelection(spec.id)}
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
