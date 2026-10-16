import { RefreshCw, Search, UserCheck, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { type Verification, verificationApi } from '../api/verification.api';
import { MyAssignmentsTab } from '../components/verification/MyAssignmentsTab';
import { ReviewProgressTab } from '../components/verification/ReviewProgressTab';
import { heritageApi } from '../services/heritage.api';
import type { Heritage } from '../types/heritage';
import { useAuthStore } from '../store/authStore';

export function VerificationPage() {
  const user = useAuthStore((state) => state.user);

  // Xác định quyền hạn
  const isExpert = ['INDEPENDENT_EXPERT', 'ORG_EXPERT'].includes(user?.role || '');
  const isAdmin = ['SYSTEM_ADMIN', 'ORG_ADMIN'].includes(user?.role || '');
  const hasBothRoles = isExpert && isAdmin;

  // State quản lý Tab
  const [activeTab, setActiveTab] = useState<'my-assignments' | 'all-reviews'>(
    isExpert ? 'my-assignments' : 'all-reviews'
  );

  // States Dữ liệu
  const [myAssignments, setMyAssignments] = useState<Verification[]>([]);
  const [adminHeritages, setAdminHeritages] = useState<Heritage[]>([]);
  const [selectedHeritageVerifications, setSelectedHeritageVerifications] = useState<Verification[]>([]);
  const [selectedHeritageId, setSelectedHeritageId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Tải nhiệm vụ Chuyên gia
  const loadMyAssignments = useCallback(async () => {
    try {
      const res = await verificationApi.getMyAssignments();
      setMyAssignments(res.data.data || []);
    } catch {
      toast.error('Không thể tải danh sách nhiệm vụ thẩm định');
    }
  }, []);

  // 2. 🟢 TẢI ĐẦY ĐỦ TẤT CẢ HỒ SƠ CHO ADMIN (Chờ gán, Đang duyệt, Đã chấp thuận, Đã từ chối)
  const loadAdminHeritages = useCallback(async () => {
    try {
      const [submittedRes, underReviewRes, verifiedRes, rejectedRes] = await Promise.all([
        heritageApi.list({ status: 'SUBMITTED' }),
        heritageApi.list({ status: 'UNDER_REVIEW' }),
        heritageApi.list({ status: 'VERIFIED' }),
        heritageApi.list({ status: 'REJECTED' }),
      ]);

      const combined = [
        ...(submittedRes.data?.data || []),
        ...(underReviewRes.data?.data || []),
        ...(verifiedRes.data?.data || []),
        ...(rejectedRes.data?.data || []),
      ];

      setAdminHeritages(combined);
    } catch {
      toast.error('Lỗi nạp danh sách hồ sơ thẩm định');
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    const apiTasks: Promise<void>[] = [];

    if (isExpert) apiTasks.push(loadMyAssignments());
    if (isAdmin) apiTasks.push(loadAdminHeritages());

    await Promise.all(apiTasks);
    setLoading(false);
  }, [isExpert, isAdmin, loadMyAssignments, loadAdminHeritages]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (isExpert && !isAdmin) setActiveTab('my-assignments');
    if (isAdmin && !isExpert) setActiveTab('all-reviews');
  }, [isExpert, isAdmin]);

  // Chi tiết phiếu của 1 di sản (cho Admin)
  const handleSelectHeritage = async (heritageId: string) => {
    setSelectedHeritageId(heritageId);
    try {
      const res = await verificationApi.getVerificationsByHeritage(heritageId);
      setSelectedHeritageVerifications(res.data?.data || []);
    } catch {
      toast.error('Không thể tải chi tiết phiếu biểu quyết');
    }
  };

  // 🟢 Kích hoạt Auto Match với số lượng chuyên gia linh hoạt do Admin chọn
  const handleAutoAssign = async (heritageId: string, count: number) => {
    if (!count || count < 1) {
      toast.error('Số lượng chuyên gia phải ít nhất là 1');
      return;
    }

    try {
      const res = await verificationApi.triggerAutoAssign(heritageId, Number(count));
      toast.success(res.data?.message || `Đã tự động phân công ${count} chuyên gia!`);
      await refreshData();
      if (selectedHeritageId === heritageId) {
        await handleSelectHeritage(heritageId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Phân công chuyên gia thất bại');
    }
  };



  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredAssignments = myAssignments.filter((item) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      item.heritage?.name?.toLowerCase().includes(keyword) ||
      item.heritage?.heritageCode?.toLowerCase().includes(keyword)
    );
  });

  const filteredAdminHeritages = adminHeritages.filter((item) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return item.name.toLowerCase().includes(keyword) || item.heritageCode.toLowerCase().includes(keyword);
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-emerald-700">
            {isAdmin ? 'Quản trị viên Hội đồng' : 'Chuyên gia Thẩm định'}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {isAdmin ? 'Theo dõi Tiến độ Thẩm định' : 'Hội đồng Kiểm duyệt Di sản'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isAdmin
              ? 'Phân công Hội đồng chuyên gia và giám sát tiến độ biểu quyết thời gian thực.'
              : 'Đánh giá, đưa ra ý kiến chuyên môn và biểu quyết chấp thuận/từ chối hồ sơ di sản.'}
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          onClick={() => void refreshData()}
          type="button"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Tải lại
        </button>
      </div>

      {/* Tabs khi User có cả 2 Role */}
      {hasBothRoles && (
        <div className="flex border-b border-stone-200">
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'my-assignments'
              ? 'border-emerald-700 font-semibold text-emerald-800'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            onClick={() => setActiveTab('my-assignments')}
          >
            <UserCheck size={18} />
            Nhiệm vụ của tôi ({myAssignments.filter((a) => a.status === 'PENDING').length} chờ duyệt)
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'all-reviews'
              ? 'border-emerald-700 font-semibold text-emerald-800'
              : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            onClick={() => setActiveTab('all-reviews')}
          >
            <Users size={18} />
            Theo dõi tiến độ Thẩm định ({adminHeritages.length})
          </button>
        </div>
      )}

      {/* Ô tìm kiếm */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
        <input
          className="w-full rounded border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-700"
          placeholder="Tìm theo tên hồ sơ di sản hoặc mã hồ sơ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Render Tab Nhiệm vụ của Chuyên gia */}
      {activeTab === 'my-assignments' && isExpert && (
        <MyAssignmentsTab
          assignments={filteredAssignments}
          loading={loading}
          onRefresh={refreshData}
        />
      )}

      {activeTab === 'all-reviews' && isAdmin && (
        <ReviewProgressTab
          heritages={filteredAdminHeritages}
          selectedHeritageId={selectedHeritageId}
          selectedVerifications={selectedHeritageVerifications}
          onSelectHeritage={handleSelectHeritage}
          onAutoAssign={handleAutoAssign}
        />
      )}
    </section>
  );
}
