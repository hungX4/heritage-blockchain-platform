import React, { useEffect, useState } from 'react';
import { Search, UserCheck, ShieldAlert, Award, X, Check, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { userAndExpertApi, User, Specialization, PaginationMeta } from '../../api/userAndExpert.api';

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // 🟢 State quản lý Phân trang
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // State phục vụ Modal phân quyền
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch danh sách người dùng khi page hoặc search thay đổi
  const fetchUsers = async (targetPage = page) => {
    try {
      setLoading(true);
      const res = await userAndExpertApi.getUsers({
        page: targetPage,
        limit: 25,
        search,
      });

      if (res.data.success) {
        setUsers(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    // Tải danh mục chuyên môn 1 lần
    userAndExpertApi.getSpecializations().then((res) => {
      if (res.data.success) setSpecializations(res.data.data);
    });
  }, []);

  // Submit tìm kiếm -> reset về trang 1
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  // 🟢 Mở Modal & Tải chuyên môn CŨ nếu đã là Expert
  const openAssignModal = async (user: User) => {
    setSelectedUser(user);
    const isExpert = user.role === 'INDEPENDENT_EXPERT' || user.role === 'ORG_EXPERT';

    if (isExpert) {
      try {
        setLoadingModal(true);
        // Gọi API lấy hồ sơ chuyên gia hiện tại
        const res = await userAndExpertApi.getExpertByUserId(user.id);
        if (res.data.success && res.data.data) {
          // Trích xuất danh sách ID chuyên môn đã có
          const currentSpecIds = res.data.data.specializationMappings?.map(
            (m: any) => m.specializationId
          ) || [];
          setSelectedSpecIds(currentSpecIds);
        } else {
          setSelectedSpecIds([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải chuyên môn cũ:', error);
        setSelectedSpecIds([]);
      } finally {
        setLoadingModal(false);
      }
    } else {
      setSelectedSpecIds([]);
    }
  };

  // Toggle chọn checkbox Chuyên môn
  const toggleSpecialization = (id: string) => {
    setSelectedSpecIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bổ nhiệm Expert
  const handleAssignExpert = async () => {
    if (!selectedUser) return;
    if (selectedSpecIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 chuyên môn');
      return;
    }

    try {
      setIsSubmitting(true);
      await userAndExpertApi.assignExpert({
        targetUserId: selectedUser.id,
        specializationIds: selectedSpecIds,
      });
      alert('Cập nhật quyền Chuyên gia thành công!');
      setSelectedUser(null);
      fetchUsers(page); // Reload lại danh sách ở trang hiện tại
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cắt chức Expert
  const handleRevokeExpert = async (user: User) => {
    if (!window.confirm(`Bạn có chắc muốn thu hồi quyền Chuyên gia của ${user.fullName}?`)) return;

    try {
      setLoading(true);
      await userAndExpertApi.revokeExpert(user.id);
      alert('Đã thu hồi quyền thành công!');
      fetchUsers(page);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý người dùng & Phân quyền</h1>
          <p className="text-sm text-slate-500">Xem danh sách, tìm kiếm và phân quyền Chuyên gia thẩm định</p>
        </div>

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-lg border border-stone-200 pl-9 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Bảng Danh sách Người dùng */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Họ và tên</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Tổ chức</th>
              <th className="px-6 py-3">Vai trò (Role)</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <RefreshCw className="mx-auto animate-spin" size={24} />
                  <p className="mt-2">Đang tải dữ liệu...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isExpert = user.role === 'INDEPENDENT_EXPERT' || user.role === 'ORG_EXPERT';
                return (
                  <tr key={user.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.fullName}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.organization?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isExpert
                          ? 'bg-purple-100 text-purple-800'
                          : user.role.includes('ADMIN')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-slate-600'
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openAssignModal(user)}
                        className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <UserCheck size={14} />
                        {isExpert ? 'Sửa chuyên môn' : 'Gán Expert'}
                      </button>

                      {isExpert && (
                        <button
                          onClick={() => handleRevokeExpert(user)}
                          className="inline-flex items-center gap-1 rounded bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          <ShieldAlert size={14} />
                          Cắt chức
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* 🟢 THANH PHÂN TRANG (PAGINATION) */}
        {!loading && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3">
            <span className="text-xs text-slate-500">
              Hiển thị {users.length} trên tổng số <strong>{pagination.total}</strong> người dùng
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="flex items-center gap-1 rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-stone-100 disabled:opacity-50"
              >
                <ChevronLeft size={14} /> Trang trước
              </button>

              <span className="text-xs font-semibold text-slate-700 px-2">
                Trang {pagination.page} / {pagination.totalPages}
              </span>

              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                className="flex items-center gap-1 rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-stone-100 disabled:opacity-50"
              >
                Trang sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PHÂN QUYỀN EXPERT */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Phân quyền Chuyên gia: <span className="text-emerald-700">{selectedUser.fullName}</span>
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-slate-500 uppercase">
                Chọn lĩnh vực chuyên môn phụ trách:
              </p>

              {loadingModal ? (
                <div className="py-8 text-center text-slate-400">
                  <RefreshCw className="mx-auto animate-spin" size={20} />
                  <p className="mt-1 text-xs">Đang tải thông tin chuyên môn cũ...</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-stone-200 rounded-lg p-3">
                  {specializations.map((spec) => {
                    const isChecked = selectedSpecIds.includes(spec.id);
                    return (
                      <label
                        key={spec.id}
                        className={`flex items-center justify-between rounded-md p-2 text-sm cursor-pointer border ${isChecked ? 'border-emerald-500 bg-emerald-50/50' : 'border-stone-100 hover:bg-stone-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Award size={16} className={isChecked ? 'text-emerald-600' : 'text-slate-400'} />
                          <span className="font-medium text-slate-700">{spec.name}</span>
                          <span className="text-xs text-slate-400">({spec.code})</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSpecialization(spec.id)}
                          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignExpert}
                disabled={isSubmitting || loadingModal}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                <Check size={16} />
                {isSubmitting ? 'Đang lưu...' : 'Xác nhận Bổ nhiệm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
