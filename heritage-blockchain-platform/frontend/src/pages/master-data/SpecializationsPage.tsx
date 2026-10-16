import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit3 } from 'lucide-react';
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

    // 🟢 ĐỌC TỪ fieldMappings
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản lý Chuyên môn Chuyên gia</h1>
          <p className="text-xs text-slate-500">Danh mục lĩnh vực chuyên sâu và ma trận loại hình thẩm định</p>
        </div>
        <button
          onClick={() => {
            setSelectedFieldIds([]);
            setCode('');
            setName('');
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
        >
          <Plus size={16} /> Thêm Chuyên môn
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 w-72">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm chuyên môn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs font-semibold uppercase text-slate-600 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3">Mã Chuyên môn</th>
              <th className="px-4 py-3">Tên Chuyên môn</th>
              <th className="px-4 py-3">Loại hình Di sản áp dụng</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
            ) : specs.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400">Chưa có chuyên môn nào</td></tr>
            ) : (
              specs.map((item: any) => (
                <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{item.code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* 🟢 ĐÃ SỬA THÀNH item.fieldMappings */}
                      {item.fieldMappings && item.fieldMappings.length > 0 ? (
                        item.fieldMappings.map((m: any) => {
                          // 🔍 Lấy tên linh hoạt từ các thuộc tính có thể xảy ra
                          const fieldName = m.heritageField?.name || m.field?.name || m.name;

                          return (
                            <span
                              key={m.id || m.heritageField?.id || m.field?.id}
                              className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200"
                            >
                              {fieldName || 'Không có tên'}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa chọn loại hình</span>
                      )}
                      <button
                        onClick={() => openMappingModal(item)}
                        className="ml-1 rounded p-1 text-slate-400 hover:bg-stone-200 hover:text-slate-700 transition-colors"
                        title="Chỉnh sửa loại hình di sản"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                      title="Xóa chuyên môn"
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

      {/* MODAL 1: TẠO MỚI CHUYÊN MÔN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">Thêm Chuyên môn mới</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Mã chuyên môn</label>
                <input
                  required
                  type="text"
                  placeholder="VD: HAN_NOM_STUDIES"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 p-2 text-sm outline-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Tên chuyên môn</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Nghiên cứu Hán Nôm & Di sản văn bản"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 p-2 text-sm outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Áp dụng cho các Loại hình Di sản (Tick chọn):
                </label>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-stone-200 p-3 space-y-2">
                  {heritageFields.length === 0 ? (
                    <p className="text-xs text-slate-400">Không có dữ liệu loại hình di sản</p>
                  ) : (
                    heritageFields.map((field) => (
                      <label key={field.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-stone-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedFieldIds.includes(field.id)}
                          onChange={() => toggleFieldSelection(field.id)}
                          className="rounded text-emerald-700 focus:ring-emerald-600"
                        />
                        <span className="font-medium">{field.name}</span>
                        <span className="text-xs text-slate-400">({field.code})</span>
                      </label>
                    ))
                  )}
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

      {/* MODAL 2: CẬP NHẬT LOẠI HÌNH DI SẢN CHO CHUYÊN MÔN */}
      {isMappingModalOpen && selectedSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">
              Gán Loại hình Di sản cho "{selectedSpec.name}"
            </h2>
            <p className="text-xs text-slate-500 mt-1">Tick chọn những loại hình di sản thuộc chuyên môn này</p>

            <div className="mt-4 max-h-60 overflow-y-auto rounded-lg border border-stone-200 p-3 space-y-2">
              {heritageFields.map((field) => (
                <label key={field.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-stone-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedFieldIds.includes(field.id)}
                    onChange={() => toggleFieldSelection(field.id)}
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span className="font-medium">{field.name}</span>
                  <span className="text-xs text-slate-400">({field.code})</span>
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
