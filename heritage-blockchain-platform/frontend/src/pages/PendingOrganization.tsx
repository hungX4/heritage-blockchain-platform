import { useEffect, useState } from 'react';
import { Building2, Mail, ExternalLink, Check, X, Loader2, Clock, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

interface PendingOrg {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  legalDocumentUrls: string[];
  createdAt: string;
}

export default function PendingOrganizationsPage() {
  const [requests, setRequests] = useState<PendingOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch danh sách chờ duyệt từ Backend
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/organization/pending');
      setRequests(res.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách đơn đăng ký');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Xử lý Phê duyệt / Từ chối
  const handleUpdateStatus = async (orgId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessingId(orgId);

      const payload = { status };
      const res = await axiosClient.patch(`/organization/${orgId}/status`, payload);

      toast.success(res.data.message || `Đã ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} thành công!`);

      // Xóa đơn vừa xử lý khỏi danh sách trên màn hình
      setRequests((prev) => prev.filter((item) => item.id !== orgId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Toaster position="top-right" />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Duyệt Đăng ký Tổ chức</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem xét và phê duyệt hồ sơ pháp lý từ các đơn vị tham gia hệ thống.
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {requests.length} Yêu cầu đang chờ
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center text-slate-500">
          <Clock size={40} className="mx-auto mb-3 text-stone-400" />
          <p className="font-medium">Hiện tại không có yêu cầu nào chờ phê duyệt.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((org) => (
            <div
              key={org.id}
              className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                {/* Thông tin Tổ chức */}
                <div className="space-y-3 md:max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-emerald-700" />
                    <h3 className="text-lg font-bold text-slate-800">{org.name}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Mail size={14} />
                    <span>{org.contactEmail}</span>
                    <span>•</span>
                    <span>Nộp ngày: {new Date(org.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <p className="text-sm text-slate-600 bg-stone-50 p-3 rounded-lg border border-stone-100">
                    {org.description}
                  </p>

                  {/* Minh chứng pháp lý */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-500">Minh chứng đính kèm:</p>
                    <div className="flex flex-wrap gap-2">
                      {org.legalDocumentUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-stone-50 hover:text-emerald-700 transition-colors"
                        >
                          <FileText size={14} />
                          <span>Tài liệu {index + 1}</span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Các nút Thao tác Duyệt / Từ chối */}
                <div className="flex items-center gap-2 border-t border-stone-100 pt-4 md:border-t-0 md:pt-0">
                  <button
                    onClick={() => handleUpdateStatus(org.id, 'APPROVED')}
                    disabled={processingId === org.id}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {processingId === org.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Phê duyệt
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(org.id, 'REJECTED')}
                    disabled={processingId === org.id}
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    <X size={14} />
                    Từ chối
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
