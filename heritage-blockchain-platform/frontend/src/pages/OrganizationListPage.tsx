import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Search, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

interface Organization {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  createdAt: string;
}

export default function OrganizationListPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        // API lấy danh sách các tổ chức đã được phê duyệt
        const res = await axiosClient.get('/organization');
        setOrganizations(res.data.data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách tổ chức:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Lọc tổ chức theo tên hoặc email khi user gõ vào thanh tìm kiếm
  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header & Thanh Tìm kiếm */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh sách Tổ chức</h1>
          <p className="mt-1 text-sm text-slate-500">
            Các cơ quan, tổ chức chính thức tham gia xác thực di sản trên hệ thống.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid danh sách */}
      {filteredOrgs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center text-slate-500">
          <Building2 size={40} className="mx-auto mb-3 text-stone-400" />
          <p className="font-medium">Không tìm thấy tổ chức phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Building2 size={20} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 size={12} /> Đã xác minh
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-800 line-clamp-1">{org.name}</h3>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail size={13} />
                  <span className="truncate">{org.contactEmail}</span>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {org.description}
                </p>
              </div>

              <div className="mt-5 border-t border-stone-100 pt-3">
                <button
                  onClick={() => navigate(`/organization/${org.id}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-50 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <span>Xem thông tin chi tiết</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
