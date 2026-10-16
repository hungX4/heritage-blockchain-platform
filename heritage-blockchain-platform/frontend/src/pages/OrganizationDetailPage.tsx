import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  ArrowLeft,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  ShieldCheck,
  UserPlus,
  LogOut,
  Clock,
  Check,
  X,
  Users,
  UserX,
  Shield,
  Crown
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';

// ==========================================
// TYPES
// ==========================================
interface OrganizationDetail {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  legalDocumentUrls: string[];
  createdAt: string;
  status: string;
  pendingRequestId?: string | null;
}

interface JoinRequestItem {
  id: string;
  createdAt: string;
  user: {
    id: string;
    fullName?: string;
    email: string;
  };
}

interface MemberItem {
  id: string;
  fullName?: string;
  email: string;
  role: 'ORG_ADMIN' | 'USER' | string;
  createdAt?: string;
}

// ==========================================
// COMPONENT 1: THÔNG TIN CHI TIẾT TỔ CHỨC
// ==========================================
function OrgDetailSection({
  org,
  user,
  pendingRequestId,
  actionLoading,
  onJoin,
  onCancelRequest,
  onLeaveOrg,
}: {
  org: OrganizationDetail;
  user: any;
  pendingRequestId: string | null;
  actionLoading: boolean;
  onJoin: () => void;
  onCancelRequest: () => void;
  onLeaveOrg: () => void;
}) {
  const isMemberOfThisOrg = user?.organizationId === org.id;
  const canJoin = !user?.organizationId && user?.role === 'USER';

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-stone-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{org.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail size={14} className="text-slate-400" /> {org.contactEmail}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" /> Ngày thành lập: {new Date(org.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <ShieldCheck size={14} /> Đã phê duyệt chính thức
          </span>

          {/* Nút Rời khỏi tổ chức (ẨN nếu là ORG_ADMIN) */}
          {isMemberOfThisOrg && user?.role !== 'ORG_ADMIN' && (
            <button
              onClick={onLeaveOrg}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              Rời khỏi tổ chức
            </button>
          )}

          {/* Nút Xin gia nhập / Hủy đơn */}
          {canJoin && (
            <>
              {pendingRequestId ? (
                <button
                  onClick={onCancelRequest}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                  Đang chờ duyệt (Hủy)
                </button>
              ) : (
                <button
                  onClick={onJoin}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Xin gia nhập
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-800">Giới thiệu & Chức năng</h3>
          <p className="whitespace-pre-line rounded-lg bg-stone-50 p-4 text-sm leading-relaxed text-slate-600 border border-stone-100">
            {org.description}
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-800">Hồ sơ & Tài liệu đính kèm</h3>
          {org.legalDocumentUrls && org.legalDocumentUrls.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {org.legalDocumentUrls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-700"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={16} className="text-slate-400" />
                    <span className="truncate">Tài liệu pháp lý #{idx + 1}</span>
                  </div>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Không có tài liệu minh chứng công khai.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT 2: QUẢN LÝ YÊU CẦU GIA NHẬP (DÀNH CHO ORG_ADMIN)
// ==========================================
function OrgPendingRequestsSection({
  orgId,
  onRequestApproved,
}: {
  orgId: string;
  onRequestApproved: () => void;
}) {
  const [requests, setRequests] = useState<JoinRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/organization/${orgId}/join-requests`);
      setRequests(res.data?.data || []);
    } catch (error) {
      console.error('Lỗi khi tải đơn xin gia nhập:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchRequests();
  }, [orgId]);

  const handleProcess = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setProcessingId(requestId);
      await axiosClient.patch(`/organization/join-requests/${requestId}`, { action });

      alert(action === 'APPROVE' ? 'Đã duyệt thành viên thành công!' : 'Đã từ chối đơn!');
      setRequests((prev) => prev.filter((item) => item.id !== requestId));

      // Nếu phê duyệt thành công -> Gọi callback reload lại danh sách thành viên
      if (action === 'APPROVE') {
        onRequestApproved();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể xử lý yêu cầu.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <Clock size={18} className="text-amber-600" />
          Duyệt đơn gia nhập ({requests.length})
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
        </div>
      ) : requests.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">Không có đơn gia nhập nào đang chờ duyệt.</p>
      ) : (
        <div className="divide-y divide-stone-100">
          {requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{req.user.fullName || 'Người dùng'}</p>
                <p className="text-xs text-slate-500">{req.user.email}</p>
                <span className="mt-1 text-[11px] text-slate-400 block">
                  Ngày gửi: {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleProcess(req.id, 'APPROVE')}
                  disabled={processingId === req.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {processingId === req.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Duyệt
                </button>
                <button
                  onClick={() => handleProcess(req.id, 'REJECT')}
                  disabled={processingId === req.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <X size={14} /> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT 3: DANH SÁCH THÀNH VIÊN TỔ CHỨC
// ==========================================
function OrgMemberListSection({
  orgId,
  isOrgAdmin,
  currentUserId,
  refreshKey,
}: {
  orgId: string;
  isOrgAdmin: boolean;
  currentUserId?: string;
  refreshKey: number;
}) {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/organization/${orgId}/members`);
      setMembers(res.data?.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách thành viên:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchMembers();
  }, [orgId, refreshKey]);

  // Admin Kick thành viên
  const handleKickMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thành viên "${memberName || 'này'}" khỏi tổ chức?`)) return;

    try {
      setActionUserId(memberId);
      await axiosClient.delete(`/organization/members/${memberId}`);
      alert('Đã xóa thành viên khỏi tổ chức!');
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể xóa thành viên.');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <Users size={18} className="text-emerald-600" />
          Danh sách thành viên ({members.length})
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
        </div>
      ) : members.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">Chưa có thành viên nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-slate-500 font-semibold">
                <th className="p-3 rounded-l-lg">Họ & Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Vai trò</th>
                {isOrgAdmin && <th className="p-3 text-right rounded-r-lg">Thao tác Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.map((member) => {
                const isAdmin = member.role === 'ORG_ADMIN';
                const isSelf = member.id === currentUserId;

                return (
                  <tr key={member.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">
                      {member.fullName || 'Thành viên'} {isSelf && <span className="text-[10px] text-emerald-600 font-bold">(Bạn)</span>}
                    </td>
                    <td className="p-3 text-slate-500">{member.email}</td>
                    <td className="p-3">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                          <Crown size={12} /> Org Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          Thành viên
                        </span>
                      )}
                    </td>

                    {/* KHU VỰC THAO TÁC CỦA ADMIN */}
                    {isOrgAdmin && (
                      <td className="p-3 text-right">
                        {!isSelf && (
                          <div className="flex items-center justify-end gap-2">
                            {/* Nút Sửa Role (Disable - Chờ bổ sung Chuyên khoa / Specialize sau) */}
                            <button
                              disabled
                              title="Tùy chỉnh vai trò sẽ được mở sau khi tích hợp phần Chuyên khoa (Specialize)"
                              className="inline-flex items-center gap-1 rounded border border-stone-200 bg-stone-100 px-2 py-1 text-[11px] font-medium text-slate-400 cursor-not-allowed"
                            >
                              <Shield size={12} /> Sửa Role
                            </button>

                            {/* Nút Kick Thành viên */}
                            <button
                              onClick={() => handleKickMember(member.id, member.fullName || member.email)}
                              disabled={actionUserId === member.id}
                              className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {actionUserId === member.id ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
                              Kick
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN PAGE: ORGANIZATION DETAIL PAGE
// ==========================================
export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = useAuthStore((state: any) => state.userData || state.user);
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const accessToken = useAuthStore((state: any) => state.accessToken);

  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [memberRefreshKey, setMemberRefreshKey] = useState(0);

  const fetchOrgDetail = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/organization/${id}`);
      const data = res.data.data;
      setOrg(data);
      setPendingRequestId(data.pendingRequestId || null);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết tổ chức:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrgDetail();
  }, [id]);

  // Handlers cho User Thường
  const handleJoinRequest = async () => {
    if (!org) return;
    try {
      setActionLoading(true);
      const res = await axiosClient.post(`/organization/${org.id}/join`);
      alert('Gửi yêu cầu gia nhập thành công!');
      setPendingRequestId(res.data?.data?.id || null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể gửi yêu cầu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequestId) return;
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu gia nhập?')) return;

    try {
      setActionLoading(true);
      await axiosClient.delete(`/organization/join-requests/${pendingRequestId}`);
      alert('Đã hủy yêu cầu.');
      setPendingRequestId(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể hủy yêu cầu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveOrganization = async () => {
    if (!user?.id) return;
    if (!window.confirm('Bạn có chắc muốn rời khỏi tổ chức này?')) return;

    try {
      setActionLoading(true);
      await axiosClient.delete(`/organization/members/${user.id}`);
      alert('Bạn đã rời khỏi tổ chức thành công.');

      if (setAuth && accessToken) {
        setAuth({ ...user, organizationId: null }, accessToken);
      }
      navigate('/organization/list');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể rời khỏi tổ chức.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <p className="text-slate-500">Không tìm thấy thông tin tổ chức.</p>
        <button
          onClick={() => navigate('/organization/list')}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:underline"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const isMemberOfThisOrg = user?.organizationId === org.id;
  const isOrgAdmin = isMemberOfThisOrg && user?.role === 'ORG_ADMIN';

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <button
        onClick={() => navigate('/organization/list')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Quay lại danh sách tổ chức
      </button>

      {/* COMPONENT 1: THÔNG TIN DETAIL */}
      <OrgDetailSection
        org={org}
        user={user}
        pendingRequestId={pendingRequestId}
        actionLoading={actionLoading}
        onJoin={handleJoinRequest}
        onCancelRequest={handleCancelRequest}
        onLeaveOrg={handleLeaveOrganization}
      />

      {/* COMPONENT 2: YÊU CẦU GIA NHẬP (CHỈ HIỆN CHO ORG_ADMIN) */}
      {isOrgAdmin && (
        <OrgPendingRequestsSection
          orgId={org.id}
          onRequestApproved={() => setMemberRefreshKey((prev) => prev + 1)}
        />
      )}

      {/* COMPONENT 3: DANH SÁCH THÀNH VIÊN (HIỆN CHO TẤT CẢ, KICK/EDIT CHỈ CHO ADMIN) */}
      <OrgMemberListSection
        orgId={org.id}
        isOrgAdmin={isOrgAdmin}
        currentUserId={user?.id}
        refreshKey={memberRefreshKey}
      />
    </div>
  );
}
