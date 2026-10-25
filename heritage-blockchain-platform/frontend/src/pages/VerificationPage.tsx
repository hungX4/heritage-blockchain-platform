import { RefreshCw, Search, UserCheck, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { type Verification, verificationApi } from '../api/verification.api';
import { MyAssignmentsTab } from '../components/verification/MyAssignmentsTab';
import { ReviewProgressTab } from '../components/verification/ReviewProgressTab';
import { heritageApi } from '../services/heritage.api';
import type { Heritage, HeritageStatus } from '../types/heritage';
import { useAuthStore } from '../store/authStore';

type FilterKey = 'ALL' | 'PENDING' | 'DONE' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

interface StatSegment {
  key: FilterKey;
  label: string;
  count: number;
  dot?: string;
}

// Bề rộng khối đỏ = bề rộng navbar thực tế (đo trên màn hình). Đổi ở đây nếu navbar thay đổi.
const NAVBAR_WIDTH = 870;
const NAVBAR_HEIGHT = 88;

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
  const [statusFilter, setStatusFilter] = useState<FilterKey>('ALL');
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

  // 2. Tải danh sách hồ sơ cho Admin
  const loadAdminHeritages = useCallback(async () => {
    try {
      const [submittedRes, underReviewRes, verifiedRes, rejectedRes] = await Promise.all([
        heritageApi.list({ status: 'SUBMITTED' as HeritageStatus }),
        heritageApi.list({ status: 'UNDER_REVIEW' as HeritageStatus }),
        heritageApi.list({ status: 'VERIFIED' as HeritageStatus }),
        heritageApi.list({ status: 'REJECTED' as HeritageStatus }),
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

  // Kích hoạt Auto Match
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

  const changeTab = (tab: 'my-assignments' | 'all-reviews') => {
    setActiveTab(tab);
    setStatusFilter('ALL');
  };

  // ===== LỌC DỮ LIỆU =====
  const keyword = search.trim().toLowerCase();
  const matchKeyword = (name?: string, code?: string) =>
    !keyword || Boolean(name?.toLowerCase().includes(keyword) || code?.toLowerCase().includes(keyword));

  const filteredAssignments = myAssignments.filter((item) => {
    if (!matchKeyword(item.heritage?.name, item.heritage?.heritageCode)) return false;
    if (statusFilter === 'PENDING') return item.status === 'PENDING';
    if (statusFilter === 'DONE') return item.status !== 'PENDING';
    return true;
  });

  const filteredAdminHeritages = adminHeritages.filter((item) => {
    if (!matchKeyword(item.name, item.heritageCode)) return false;
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  // ===== THANH THỐNG KÊ =====
  const showingExpertTab = activeTab === 'my-assignments' && isExpert;
  const showingAdminTab = activeTab === 'all-reviews' && isAdmin;

  const countAdmin = (s: string) => adminHeritages.filter((h) => h.status === s).length;
  const pendingCount = myAssignments.filter((a) => a.status === 'PENDING').length;

  const segments: StatSegment[] = showingExpertTab
    ? [
      { key: 'ALL', label: 'Tất cả nhiệm vụ', count: myAssignments.length },
      { key: 'PENDING', label: 'Chờ bạn thẩm định', count: pendingCount, dot: 'bg-amber-500' },
      { key: 'DONE', label: 'Đã xử lý', count: myAssignments.length - pendingCount, dot: 'bg-emerald-700' },
    ]
    : [
      { key: 'ALL', label: 'Tất cả hồ sơ', count: adminHeritages.length },
      { key: 'SUBMITTED', label: 'Chờ phân công', count: countAdmin('SUBMITTED'), dot: 'bg-amber-500' },
      { key: 'UNDER_REVIEW', label: 'Đang thẩm định', count: countAdmin('UNDER_REVIEW'), dot: 'bg-sky-600' },
      { key: 'VERIFIED', label: 'Đã chấp thuận', count: countAdmin('VERIFIED'), dot: 'bg-emerald-700' },
      { key: 'REJECTED', label: 'Đã từ chối', count: countAdmin('REJECTED'), dot: 'bg-rose-700' },
    ];

  const resultCount = showingExpertTab ? filteredAssignments.length : filteredAdminHeritages.length;

  return (
    <div className="relative min-h-screen bg-[#fbfbf9] pb-16 pt-32 font-sans text-slate-800">
      {/* ===== KHỐI ĐỎ ÔM SÁT NAVBAR (vuông góc, nằm sau navbar) ===== */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-0 max-w-full -translate-x-1/2 bg-[#A50C1E]"
        style={{ width: NAVBAR_WIDTH, height: NAVBAR_HEIGHT }}
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* ================= TIÊU ĐỀ + NÚT TẢI LẠI ================= */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl border-l-4 border-[#A50C1E] pl-4">
            <h1 className="font-serif text-2xl font-bold leading-tight text-slate-900 sm:text-3xl"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
              {isAdmin ? 'Tiến độ thẩm định hồ sơ' : 'Hội đồng kiểm duyệt di sản'}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {isAdmin
                ? 'Phân công hội đồng chuyên gia và theo dõi tiến độ biểu quyết của từng hồ sơ di sản.'
                : 'Xem xét hồ sơ được giao, đưa ra ý kiến chuyên môn và biểu quyết chấp thuận hoặc từ chối.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshData()}
            disabled={loading}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2   bg-[#fbfbf9] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A50C1E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Đang tải...' : ''}
          </button>
        </div>

        {/* ================= TAB VAI TRÒ (chỉ hiện khi có cả 2 quyền) ================= */}
        {hasBothRoles && (
          <div className="flex flex-wrap gap-2" role="tablist">
            {[
              {
                id: 'my-assignments' as const,
                icon: <UserCheck size={16} />,
                label: 'Nhiệm vụ của tôi',
                badge: pendingCount > 0 ? `${pendingCount} chờ duyệt` : null,
              },
              {
                id: 'all-reviews' as const,
                icon: <Users size={16} />,
                label: 'Theo dõi tiến độ',
                badge: `${adminHeritages.length}`,
              },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeTab(tab.id)}
                  className={`inline-flex cursor-pointer items-center gap-2 border px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A50C1E] ${active
                    ? 'border-[#A50C1E] bg-[#A50C1E] text-amber-300'
                    : 'border-stone-300 bg-white text-slate-700 hover:border-[#A50C1E] hover:text-[#A50C1E]'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs font-bold ${active ? 'bg-black/25 text-white' : 'bg-stone-200 text-slate-700'
                        }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}



        {/* ================= TÌM KIẾM + SỐ KẾT QUẢ ================= */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              className="h-11 w-full border border-stone-400 bg-white pl-11 pr-10 text-sm text-slate-900 placeholder-slate-500 outline-none transition-colors focus:border-[#A50C1E] focus:ring-1 focus:ring-[#A50C1E]"
              placeholder="Tìm theo tên hoặc mã hồ sơ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm hồ sơ"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-slate-500 hover:text-[#A50C1E]"
                aria-label="Xóa từ khóa"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <p className="text-sm text-slate-600">
            Đang hiển thị <strong className="text-slate-900">{resultCount}</strong> hồ sơ
            {(keyword || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                }}
                className="ml-3 cursor-pointer font-bold text-[#A50C1E] underline underline-offset-2 hover:text-[#8a0a19]"
              >
                Bỏ lọc
              </button>
            )}
          </p>
        </div>

        {/* ================= NỘI DUNG THEO TAB ================= */}
        <div className="min-h-[280px]">
          {showingExpertTab && (
            <MyAssignmentsTab
              assignments={filteredAssignments}
              loading={loading}
              onRefresh={refreshData}
            />
          )}

          {showingAdminTab && (
            <ReviewProgressTab
              heritages={filteredAdminHeritages}
              selectedHeritageId={selectedHeritageId}
              selectedVerifications={selectedHeritageVerifications}
              onSelectHeritage={handleSelectHeritage}
              onAutoAssign={handleAutoAssign}
            />
          )}
        </div>
      </div>
    </div>
  );
}
