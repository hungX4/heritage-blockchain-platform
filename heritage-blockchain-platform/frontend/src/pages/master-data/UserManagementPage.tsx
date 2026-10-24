import React, { useEffect, useState } from 'react';
import { Search, UserCheck, ShieldAlert, Award, X, Check, RefreshCw, ChevronLeft, ChevronRight, Eye, Users } from 'lucide-react';
import { userAndExpertApi, User, Specialization, PaginationMeta } from '../../api/userAndExpert.api';

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // State quản lý Phân trang
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
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const openUserDetail = async (user: User) => {
    setLoadingDetail(true);
    try {
      const res = await userAndExpertApi.getUserById(user.id);
      setDetailUser(res.data.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể tải chi tiết người dùng');
    } finally {
      setLoadingDetail(false);
    }
  };

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

  // Mở Modal & Tải chuyên môn CŨ nếu đã là Expert
  const openAssignModal = async (user: User) => {
    setSelectedUser(user);
    const isExpert = user.role === 'INDEPENDENT_EXPERT' || user.role === 'ORG_EXPERT';

    if (isExpert) {
      try {
        setLoadingModal(true);
        const res = await userAndExpertApi.getExpertByUserId(user.id);
        if (res.data.success && res.data.data) {
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
      fetchUsers(page);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thu hồi quyền Expert
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
    <div className="min-h-screen bg-[#fbfbf9] font-sans text-slate-800 pb-16">

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[88px] w-[870px] left-1/2 -translate-x-1/2 bg-[#A50C1E]" />
      {/* ================= PHẦN ĐẦU TRANG: KHỐI ĐỎ CỜ DI SẢN ================= */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-black pt-32  leading-tight"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Quản Lý Người Dùng & Phân Quyền
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
              Tra cứu danh sách thành viên, xem thông tin chi tiết và bổ nhiệm Hội đồng Chuyên gia thẩm định di sản.
            </p>
          </div>
        </div>
      </div>

      {/* ================= THÂN TRANG (BACKGROUND CANVAS TRẮNG) ================= */}
      <div className="mx-auto -mt-6 max-w-6xl space-y-5 px-4 sm:px-6 lg:px-8">

        {/* Thanh Tìm Kiếm Đen Trắng */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-stone-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-stone-400 outline-none focus:border-black transition-colors"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-black px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            >
              Tìm kiếm
            </button>
          </form>

          <p className="text-xs text-slate-500 font-medium">
            Tổng cộng: <strong className="text-slate-900">{pagination.total}</strong> người dùng
          </p>
        </div>

        {/* Bảng Danh sách Người dùng */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-stone-200 bg-stone-100 text-[11px] font-bold uppercase text-slate-800">
              <tr>
                <th className="px-6 py-3.5">Họ và tên</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Tổ chức</th>
                <th className="px-6 py-3.5">Vai trò (Role)</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto animate-spin mb-2" size={20} />
                    <p className="text-xs">Đang tải dữ liệu người dùng...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isExpert = user.role === 'INDEPENDENT_EXPERT' || user.role === 'ORG_EXPERT';
                  const isAdmin = user.role.includes('ADMIN');

                  return (
                    <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                      <td
                        className="px-6 py-4 font-bold text-slate-900 text-sm"
                        style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                      >
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{user.organization?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold font-mono uppercase border ${isExpert
                            ? 'bg-slate-900 text-white border-slate-900'
                            : isAdmin
                              ? 'bg-[#A50C1E] text-white border-[#A50C1E]'
                              : 'bg-stone-100 text-slate-700 border-stone-200'
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openUserDetail(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <Eye size={13} /> Chi tiết
                        </button>

                        <button
                          type="button"
                          onClick={() => openAssignModal(user)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                          <UserCheck size={13} />
                          {isExpert ? 'Sửa chuyên môn' : 'Gán Expert'}
                        </button>

                        {isExpert && (
                          <button
                            type="button"
                            onClick={() => handleRevokeExpert(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-stone-200 transition-colors cursor-pointer"
                          >
                            <ShieldAlert size={13} />
                            Thu hồi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* THANH PHÂN TRANG (PAGINATION) */}
          {!loading && pagination.totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3">
              <span className="text-xs text-slate-500">
                Hiển thị <strong className="text-slate-900">{users.length}</strong> trên <strong className="text-slate-900">{pagination.total}</strong> người dùng
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-stone-100 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} /> Trước
                </button>

                <span className="text-xs font-bold text-slate-800 px-2 font-mono">
                  {pagination.page} / {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-stone-100 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL CHI TIẾT NGƯỜI DÙNG */}
      {loadingDetail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="rounded-xl bg-white px-6 py-4 text-xs font-bold text-slate-800 shadow-xl border border-stone-200">
            Đang tải thông tin chi tiết...
          </div>
        </div>
      )}

      {detailUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDetailUser(null)}
        >
          <section
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-slate-800"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Chi Tiết Tài Khoản Người Dùng
              </h2>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setDetailUser(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold text-slate-400 uppercase">Họ và tên</dt>
                <dd
                  className="mt-1 font-bold text-slate-900 text-sm"
                  style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                >
                  {detailUser.fullName}
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-bold text-slate-400 uppercase">Vai trò (Role)</dt>
                <dd className="mt-1 font-mono font-bold text-slate-900">{detailUser.role}</dd>
              </div>

              <div>
                <dt className="text-[11px] font-bold text-slate-400 uppercase">Email</dt>
                <dd className="mt-1 break-all font-mono text-slate-800">{detailUser.email}</dd>
              </div>

              <div>
                <dt className="text-[11px] font-bold text-slate-400 uppercase">Tổ chức</dt>
                <dd className="mt-1 font-semibold text-slate-800">{detailUser.organization?.name || 'Chưa thuộc tổ chức'}</dd>
              </div>

              <div>
                <dt className="text-[11px] font-bold text-slate-400 uppercase">Ngày tạo tài khoản</dt>
                <dd className="mt-1 text-slate-700">{detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString('vi-VN') : '—'}</dd>
              </div>

              <div>
                <dt className="text-[11px] font-bold text-slate-400 uppercase">Mã người dùng (ID)</dt>
                <dd className="mt-1 break-all font-mono text-[11px] text-slate-600">{detailUser.id}</dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end border-t border-stone-200 pt-4">
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </section>
        </div>
      )}

      {/* MODAL PHÂN QUYỀN EXPERT */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Bổ Nhiệm Chuyên Gia Thẩm Định
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                Thành viên: <strong className="text-slate-900">{selectedUser.fullName}</strong> ({selectedUser.email})
              </p>

              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Chọn các lĩnh vực chuyên môn phụ trách:
              </p>

              {loadingModal ? (
                <div className="py-8 text-center text-slate-400">
                  <RefreshCw className="mx-auto animate-spin mb-1" size={18} />
                  <p className="text-xs">Đang tải danh mục chuyên môn...</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-stone-200 rounded-xl p-3 bg-stone-50">
                  {specializations.map((spec) => {
                    const isChecked = selectedSpecIds.includes(spec.id);
                    return (
                      <label
                        key={spec.id}
                        className={`flex items-center justify-between rounded-lg p-2.5 text-xs cursor-pointer border transition-all ${isChecked
                          ? 'border-black bg-white shadow-xs font-bold'
                          : 'border-stone-200 bg-white hover:bg-stone-100/80 text-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Award size={15} className={isChecked ? 'text-black' : 'text-stone-400'} />
                          <span className="font-semibold text-slate-800">{spec.name}</span>
                          <span className="font-mono text-[10px] text-stone-400">({spec.code})</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSpecialization(spec.id)}
                          className="h-4 w-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleAssignExpert}
                disabled={isSubmitting || loadingModal}
                className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              >
                <Check size={15} />
                <span>{isSubmitting ? 'Đang lưu...' : 'Xác nhận Bổ nhiệm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
