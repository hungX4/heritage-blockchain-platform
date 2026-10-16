//Cho phép: Tạo Loại hình di sản + tick chọn Chuyên môn liên quan ngay lúc tạo
//đồng thời sửa danh sách Chuyên môn trực tiếp bằng Modal Tick-select trong bảng danh sách.

import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit3, Check, Layers } from 'lucide-react';
import { masterDataApi, HeritageField, Specialization } from '../../api/masterData.api';
import { useDebounce } from '../../hooks/useDebounce';

export function HeritageFieldsPage() {
  const [fields, setFields] = useState<HeritageField[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<HeritageField | null>(null);

  // Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản lý Loại hình Di sản</h1>
          <p className="text-xs text-slate-500">Cấu hình loại hình và ma trận chuyên môn thẩm định</p>
        </div>
        <button
          onClick={() => {
            setSelectedSpecIds([]);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus size={16} /> Thêm Loại hình
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 w-72">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm mã hoặc tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none"
        />
      </div>

      {/* Table List */}
      <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs font-semibold uppercase text-slate-600 border-b">
            <tr>
              <th className="px-4 py-3">Mã Loại hình</th>
              <th className="px-4 py-3">Tên Loại hình</th>
              <th className="px-4 py-3">Chuyên môn thẩm định yêu cầu</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400">Đang tải...</td></tr>
            ) : fields.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400">Chưa có dữ liệu</td></tr>
            ) : (
              fields.map((field) => (
                <tr key={field.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{field.code}</td>
                  <td className="px-4 py-3 text-slate-800 font-semibold">{field.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {field.specializationMappings && field.specializationMappings.length > 0 ? (
                        field.specializationMappings.map((m) => (
                          <span
                            key={m.id}
                            className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200"
                          >
                            {m.specialization.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa gán chuyên môn</span>
                      )}
                      <button
                        onClick={() => openMappingModal(field)}
                        className="ml-1 rounded p-1 text-slate-400 hover:bg-stone-200 hover:text-slate-700"
                        title="Sửa chuyên môn"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(field.id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: TẠO MỚI */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">Thêm Loại hình Di sản</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Mã loại hình</label>
                <input
                  required
                  type="text"
                  placeholder="VD: INTANGIBLE_HERITAGE"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 p-2 text-sm outline-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Tên loại hình</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Di sản văn hóa phi vật thể"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 p-2 text-sm outline-emerald-600"
                />
              </div>

              {/* Tick chọn Chuyên môn */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Gán Chuyên môn thẩm định (Tick chọn):
                </label>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-stone-200 p-3 space-y-2">
                  {specializations.map((spec) => (
                    <label key={spec.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSpecIds.includes(spec.id)}
                        onChange={() => toggleSpecSelection(spec.id)}
                        className="rounded text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>{spec.name}</span>
                      <span className="text-xs text-slate-400">({spec.code})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SỬA TIK-SELECT MAPPING */}
      {isMappingModalOpen && selectedField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">
              Cập nhật Chuyên môn cho "{selectedField.name}"
            </h2>
            <p className="text-xs text-slate-500 mt-1">Tick chọn những chuyên môn có quyền thẩm định loại hình này</p>

            <div className="mt-4 max-h-60 overflow-y-auto rounded-lg border border-stone-200 p-3 space-y-2">
              {specializations.map((spec) => (
                <label key={spec.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSpecIds.includes(spec.id)}
                    onChange={() => toggleSpecSelection(spec.id)}
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>{spec.name}</span>
                  <span className="text-xs text-slate-400">({spec.code})</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsMappingModalOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-stone-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveMapping}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
