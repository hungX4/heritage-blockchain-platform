import { RefreshCw, Database } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { heritageApi } from '../services/heritage.api';
import { masterDataApi } from '../api/masterData.api';
import { organizationApi } from '../api/organization.api';
import type { Heritage, HeritagePayload, HeritageStatus } from '../types/heritage';

import { HeritageForm } from '../components/heritage/HeritageForm';
import { HeritageList } from '../components/heritage/HeritageList';

interface DropdownOption {
  id: string;
  name: string;
}

export function CreateHeritage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [editingHeritage, setEditingHeritage] = useState<HeritagePayload | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [categories, setCategories] = useState<DropdownOption[]>([]);
  const [organizations, setOrganizations] = useState<DropdownOption[]>([]);

  const [status, setStatus] = useState<HeritageStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadHeritages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await heritageApi.list({ status, search });
      setHeritages(response.data?.data || response.data || []);
    } catch {
      toast.error('Không thể tải danh sách hồ sơ di sản.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  const loadMasterData = async () => {
    try {
      const [catRes, orgRes] = await Promise.all([
        masterDataApi.getHeritageFields(),
        organizationApi.getApprovedList(),
      ]);

      setCategories(catRes.data?.data || catRes.data || []);
      setOrganizations(orgRes.data?.data || orgRes.data || []);
    } catch (err) {
      console.error('Lỗi nạp danh mục dữ liệu:', err);
    }
  };

  useEffect(() => {
    void loadHeritages();
    void loadMasterData();
  }, [loadHeritages]);

  const handleFormSubmit = async (payload: HeritagePayload) => {
    try {
      if (editingId) {
        await heritageApi.update(editingId, payload);
        toast.success('Đã cập nhật hồ sơ di sản thành công!');
      } else {
        await heritageApi.create(payload);
        toast.success('Đã tạo hồ sơ di sản thành công!');
      }
      setEditingId(null);
      setEditingHeritage(null);
      await loadHeritages();
    } catch {
      toast.error('Không thể lưu hồ sơ. Hãy kiểm tra lại thông tin.');
    }
  };

  // Áp dụng Map giữa fieldId của Heritage sang category trong Form Payload
  const startEdit = (heritage: Heritage) => {
    setEditingId(heritage.id);
    setEditingHeritage({
      heritageCode: heritage.heritageCode,
      name: heritage.name,
      description: heritage.description,
      category: heritage.fieldId || heritage.field?.id || '',
      location: heritage.location || [],
      source: heritage.source,
      sourceOrganization: heritage.sourceOrganization,
      sourceDocumentNumber: heritage.sourceDocumentNumber || '',
      sourceUrl: heritage.sourceUrl || '',
      sourceDocumentCid: heritage.sourceDocumentCid || '',
      recognizedAt: heritage.recognizedAt ? new Date(heritage.recognizedAt).toISOString().split('T')[0] : '',
      media: heritage.media || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      await heritageApi.submit(id);
      toast.success('Đã gửi hồ sơ sang trạng thái chờ kiểm duyệt!');
      await loadHeritages();
    } catch {
      toast.error('Chỉ hồ sơ DRAFT hoặc REJECTED mới có thể gửi kiểm duyệt.');
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa hồ sơ di sản này?')) return;
    try {
      await heritageApi.remove(id);
      toast.success('Đã xóa hồ sơ di sản thành công.');
      await loadHeritages();
    } catch {
      toast.error('Lỗi! Không thể xóa hồ sơ di sản.');
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-stone-100 p-4 sm:p-6 lg:p-8 font-sans select-none space-y-8 overflow-x-hidden">

      {/* ================= BACKGROUND IMAGE (DECOR) ================= */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black opacity-90" /> {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: 'url(https://wallpaperaccess.com/full/2165.jpg)',
          }}
        />
        {/* Subtle amber glow blend at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-amber-950/20 to-transparent blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 space-y-8">

        {/* ================= HEADER TIÊU ĐỀ (DARK THEME) ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-stone-800/80 pb-5 pt-20">
          <div>
            <h1
              className="text-2xl sm:text-2xl font-bold text-white tracking-normal"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Lập & Khai Báo Hồ Sơ Di Sản
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-400">
              Khởi tạo, chỉnh sửa thông tin di sản văn hóa và gửi kiểm duyệt lên Blockchain.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-xs font-bold text-stone-300 hover:bg-[#A50C1E] hover:border-[#A50C1E] hover:text-white transition-all cursor-pointer shrink-0 shadow-lg"
            onClick={() => void loadHeritages()}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-amber-300' : ''} />
            <span>Tải lại dữ liệu</span>
          </button>
        </div>

        {/* ================= KHỐI FORM KÊ KHAI (DARK PANEL) ================= */}
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur">
          <HeritageForm
            initialData={editingHeritage}
            categories={categories}
            organizations={organizations}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setEditingId(null);
              setEditingHeritage(null);
            }}
          />
        </div>

        {/* ================= KHỐI DANH SÁCH HỒ SƠ (DARK PANEL) ================= */}
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur">
          <HeritageList
            heritages={heritages}
            loading={loading}
            status={status}
            search={search}
            onStatusChange={setStatus}
            onSearchChange={setSearch}
            onSearchSubmit={() => void loadHeritages()}
            onEdit={startEdit}
            onSubmitForReview={(id) => void handleSubmitForReview(id)}
            onRemove={(id) => void handleRemove(id)}
          />
        </div>
      </div>

    </div>
  );
}
