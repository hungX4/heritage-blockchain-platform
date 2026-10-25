import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Music,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  Globe,
  Award,
  Maximize2,
  Share2,
  Printer,
  Link as LinkIcon,
} from 'lucide-react';
import { heritageVersionApi } from '../api/heritage-version.api';
import { heritageApi } from '../api/heritage.api';
import { integrityApi } from '../api/integrity.api';
import {
  Heritage,
  HeritageStatus,
  HeritageVersionItem,
  HeritageIntegrityResult,
  LocationItem,
  HeritageVersionMedia,
} from '../types/heritage';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function HeritageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [versionData, setVersionData] = useState<HeritageVersionItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State quản lý Media
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);

  // State Modals
  const [verifying, setVerifying] = useState<boolean>(false);
  const [integrityData, setIntegrityData] = useState<HeritageIntegrityResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption?: string } | null>(null);

  const [heritageRecord, setHeritageRecord] = useState<Heritage | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Tải thông tin
  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await heritageVersionApi.getVersionById(id);
      if (res.data) {
        setVersionData(res.data);
        const heritageRes = await heritageApi.getById(res.data.heritageId);
        setHeritageRecord(heritageRes.data);
      } else {
        toast.error('Không tìm thấy dữ liệu di sản');
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết di sản:', error);
      toast.error('Không thể lấy thông tin di sản');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!heritageRecord) return;
    const nextStatus = event.target.value as HeritageStatus;
    try {
      setStatusSubmitting(true);
      const response = await heritageApi.updateStatus(heritageRecord.id, nextStatus);
      setHeritageRecord(response.data);
      toast.success('Đã cập nhật trạng thái hồ sơ');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái hồ sơ');
    } finally {
      setStatusSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Kiểm tra tính toàn vẹn Blockchain
  const handleCheckIntegrity = async () => {
    if (!versionData?.heritageId) return;
    try {
      setVerifying(true);
      const res = await integrityApi.verifyIntegrity(versionData.heritageId);
      setIntegrityData(res.data);
    } catch (error: any) {
      console.error('Lỗi xác thực toàn vẹn:', error);
      toast.error(error.response?.data?.message || 'Không thể xác thực toàn vẹn hồ sơ');
    } finally {
      setVerifying(false);
    }
  };

  // Helper Sao chép
  const handleCopyText = (text: string, msg: string = 'Đã sao chép') => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  // Chức năng Chia sẻ / In / Liên kết
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: versionData?.canonicalData?.heritage?.name || 'Chi tiết di sản',
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      handleCopyText(window.location.href, 'Đã sao chép liên kết chia sẻ!');
    }
  };

  const handleCopyLink = () => {
    handleCopyText(window.location.href, 'Đã sao chép đường dẫn liên kết!');
  };

  // Helper địa điểm
  const renderLocations = (locations?: LocationItem[] | null) => {
    if (!locations || locations.length === 0) return 'Chưa có thông tin địa giới';
    return locations
      .map((loc) => [loc.ward, loc.district, loc.province].filter(Boolean).join(', '))
      .join('; ');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbf9] pt-24">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={36} className="animate-spin text-[#A50C1E]" />
          <p className="text-xs font-medium text-slate-600">Đang tải thông tin hồ sơ di sản...</p>
        </div>
      </div>
    );
  }

  if (!versionData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbfbf9] p-6 text-center pt-24">
        <AlertTriangle size={48} className="text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy di sản</h2>
        <p className="mt-1 text-xs text-slate-500">Hồ sơ di sản có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
        <button
          onClick={() => navigate('/heritages')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#A50C1E] px-4 py-2 text-xs font-bold text-white hover:bg-red-800 transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const canonical = versionData.canonicalData;
  const heritage = canonical?.heritage;
  const field = canonical?.field;

  const mediaList: HeritageVersionMedia[] =
    versionData.mediaList ||
    versionData.media ||
    canonical?.media ||
    [];

  const currentMedia = mediaList[activeMediaIndex] || null;

  return (
    <div className="relative min-h-screen bg-[#fbfbf9] text-slate-800 pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-sans">

      {/* ===== KHỐI ĐỎ PHỦ KÍN CHIỀU NGANG MÀN HÌNH, PHÍA SAU NAVBAR ===== */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[88px] w-[870px] left-1/2 -translate-x-1/2 bg-[#A50C1E]" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-5">



        {/* ================= KHUNG HIỂN THỊ MEDIA (CAO THEO MÀN HÌNH) ================= */}
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">

          {/* Khung cố định: rộng full cột, cao 45% chiều cao màn hình (200px – 440px) */}
          <div className="relative w-full h-[clamp(200px,45vh,440px)] flex items-center justify-center bg-[#fbfbf9] overflow-hidden group">
            {!currentMedia ? (
              <div className="flex flex-col items-center gap-2 px-4 text-center text-stone-400">
                <ImageIcon size={48} className="opacity-30" />
                <p className="text-xs">Chưa có phương tiện hình ảnh / video đính kèm</p>
              </div>
            ) : currentMedia.type?.toUpperCase() === 'VIDEO' ? (
              <video
                controls
                src={currentMedia.url}
                poster={currentMedia.thumbnailUrl}
                className="h-full w-full object-contain bg-black"
              />
            ) : currentMedia.type?.toUpperCase() === 'AUDIO' ? (
              <div className="h-full w-full p-4 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 bg-stone-50 overflow-y-auto">
                <div className="p-3 sm:p-4 rounded-full bg-red-100 text-[#A50C1E]">
                  <Music size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{currentMedia.caption || 'Bản ghi âm tư liệu'}</p>
                  {currentMedia.cid && <p className="text-[11px] font-mono text-slate-500 mt-1 break-all">CID: {currentMedia.cid}</p>}
                </div>
                <audio controls src={currentMedia.url} className="w-full max-w-md h-10" />
              </div>
            ) : (
              <>
                <img
                  src={currentMedia.url || currentMedia.thumbnailUrl}
                  alt={currentMedia.caption || 'Ảnh di sản'}
                  className="h-full w-full object-contain"
                />
                <button
                  onClick={() => setSelectedImage({ url: currentMedia.url || currentMedia.thumbnailUrl || '', caption: currentMedia.caption })}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-lg bg-black/50 text-white hover:bg-[#A50C1E] transition-all sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  title="Phóng to ảnh"
                >
                  <Maximize2 size={16} />
                </button>
              </>
            )}
          </div>


          {/* Thumbnails danh sách Media */}
          {mediaList.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 max-w-full">
              {mediaList.map((m, idx) => {
                const isSelected = activeMediaIndex === idx;
                return (
                  <button
                    key={m.id || idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative h-16 w-20 shrink-0 rounded-lg border overflow-hidden transition-all cursor-pointer ${isSelected
                      ? 'border-[#A50C1E] ring-2 ring-[#A50C1E]/30 scale-105'
                      : 'border-stone-200 bg-stone-100 opacity-70 hover:opacity-100'
                      }`}
                  >
                    {m.type?.toUpperCase() === 'AUDIO' ? (
                      <div className="flex h-full w-full items-center justify-center bg-stone-100 text-[#A50C1E]">
                        <Music size={20} />
                      </div>
                    ) : m.type?.toUpperCase() === 'VIDEO' ? (
                      <div className="relative h-full w-full bg-black flex items-center justify-center">
                        <Video size={18} className="text-white" />
                      </div>
                    ) : (
                      <img src={m.url || m.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* HÀNG CÔNG CỤ: CHIA SẺ | IN | LIÊN KẾT | XÁC THỰC ON-CHAIN */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2.5 text-xs sm:text-sm text-slate-600 border-b border-stone-200 w-full">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 hover:text-[#A50C1E] transition-colors cursor-pointer"
            >
              <Share2 size={15} /> Chia sẻ
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 hover:text-[#A50C1E] transition-colors cursor-pointer"
            >
              <Printer size={15} /> In
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 hover:text-[#A50C1E] transition-colors cursor-pointer"
            >
              <LinkIcon size={15} /> Liên kết
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={handleCheckIntegrity}
              disabled={verifying}
              className="inline-flex items-center gap-1.5 font-bold text-[#A50C1E] hover:text-red-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              <span>{verifying ? 'Đang xác minh...' : 'Xác thực On-Chain'}</span>
            </button>
          </div>
        </div>

        {/* ================= TIÊU ĐỀ DI SẢN & BẢNG THÔNG TIN CHI TIẾT ================= */}
        <div className="space-y-4 pt-2">

          {/* Tên tiêu đề tác phẩm / di sản */}
          <h1
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            {heritage?.name || 'Chưa có tên di sản'}
          </h1>

          {/* Bảng danh sách thông tin chuẩn kẻ ngang */}
          <div className="border-t border-stone-200 divide-y divide-stone-200 text-xs sm:text-sm">

            {/* Tác giả / Nguồn đơn vị */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-baseline">
              <span className="font-bold text-slate-900">Tác giả / Đơn vị quản lý:</span>
              <span className="sm:col-span-3 text-slate-700 font-medium">
                {heritage?.sourceOrganization || heritage?.source || '—'}
              </span>
            </div>

            {/* Loại hình di sản */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-baseline">
              <span className="font-bold text-slate-900">Loại hình / Danh mục:</span>
              <span className="sm:col-span-3 text-slate-700">
                {field?.name || 'Chưa phân loại'}
              </span>
            </div>

            {/* Mã di sản */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-baseline">
              <span className="font-bold text-slate-900">Mã hồ sơ di sản:</span>
              <span className="sm:col-span-3 font-mono font-medium text-slate-800">
                {heritage?.heritageCode || '—'}
              </span>
            </div>

            {/* Thời gian công nhận / sáng tác */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-baseline">
              <span className="font-bold text-slate-900">Thời gian công nhận / Sáng tác:</span>
              <span className="sm:col-span-3 text-slate-700">
                {heritage?.recognizedAt
                  ? new Date(heritage.recognizedAt).toLocaleDateString('vi-VN')
                  : '—'}
              </span>
            </div>

            {/* Số hiệu quyết định (nếu có) */}
            {heritage?.sourceDocumentNumber && (
              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-baseline">
                <span className="font-bold text-slate-900">Số hiệu quyết định / Căn cứ:</span>
                <span className="sm:col-span-3 text-slate-700">
                  {heritage.sourceDocumentNumber}
                </span>
              </div>
            )}

            {/* Mã IPFS CID (nếu có) */}
            {heritage?.sourceDocumentCid && (
              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-baseline">
                <span className="font-bold text-slate-900">Mã IPFS CID văn bản:</span>
                <span className="sm:col-span-3 font-mono text-xs text-[#A50C1E] break-all">
                  {heritage.sourceDocumentCid}
                </span>
              </div>
            )}

            {/* Link văn bản tư liệu gốc */}
            {heritage?.sourceUrl && (
              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-baseline">
                <span className="font-bold text-slate-900">Tư liệu tham chiếu:</span>
                <span className="sm:col-span-3">
                  <a
                    href={heritage.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#A50C1E] hover:underline"
                  >
                    <Globe size={14} /> Xem quyết định / tư liệu gốc <ExternalLink size={12} />
                  </a>
                </span>
              </div>
            )}

            {/* Hiện vật / Di sản đang lưu giữ tại */}
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-baseline">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin size={16} className="text-[#A50C1E]" /> Địa điểm / Lưu giữ tại:
              </span>
              <span className="sm:col-span-3 font-semibold text-[#A50C1E]">
                {renderLocations(heritage?.location)}
              </span>
            </div>

          </div>
        </div>
        {/* CẬP NHẬT TRẠNG THÁI (CHỈ VỚI SYSTEM ADMIN) */}
        {currentUser?.role === 'SYSTEM_ADMIN' && heritageRecord && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Award size={18} className="text-[#A50C1E]" />
              <span className="text-xs font-bold uppercase tracking-wide">Trạng Thái Hồ Sơ (Quản trị viên)</span>
            </div>
            <select
              aria-label="Cập nhật trạng thái hồ sơ"
              value={heritageRecord.status}
              onChange={handleStatusChange}
              disabled={statusSubmitting}
              className="rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-slate-800 focus:border-[#A50C1E] outline-none cursor-pointer"
            >
              {Object.values(HeritageStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* ================= MÔ TẢ CHI TIẾT NẰM Ở DƯỚI CÙNG ================= */}
        <div className="pt-6 border-t border-stone-200 space-y-3">
          <h2
            className="text-lg font-bold text-slate-900 flex items-center gap-2"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            <FileText size={18} className="text-[#A50C1E]" /> Mô Tả Chi Tiết
          </h2>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
            {heritage?.description || 'Chưa có thông tin mô tả chi tiết cho di sản này.'}
          </div>
        </div>

      </div>

      {/* ================= MODAL XÁC THỰC TOÀN VẸN INTEGRITY ================= */}
      {integrityData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-stone-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl border ${integrityData.integrityValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                >
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3
                    className="text-base font-bold text-slate-900"
                    style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                  >
                    Kết Quả Xác Thực Toàn Vẹn On-Chain
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phiên bản v{integrityData.version} • {new Date(integrityData.verifiedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIntegrityData(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-stone-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 ${integrityData.integrityValid
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                  : 'border-red-200 bg-red-50/50 text-red-900'
                  }`}
              >
                {integrityData.integrityValid ? (
                  <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={22} className="text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider">
                    {integrityData.integrityValid
                      ? 'Dữ liệu đảm bảo toàn vẹn tuyệt đối'
                      : 'Cảnh báo: Dữ liệu có sự sai lệch'}
                  </p>
                  <p className="text-xs mt-1 text-slate-600 leading-relaxed">
                    {integrityData.integrityValid
                      ? 'Mã Hash tính toán từ CSDL hoàn toàn trùng khớp với bản ghi được niêm phong trên Smart Contract.'
                      : 'Mã Hash trong CSDL khác với bản ghi On-Chain. Hồ sơ có thể đã bị can thiệp ngoài hệ thống.'}
                  </p>
                </div>
              </div>

              {/* Chi tiết Hash so sánh */}
              <div className="space-y-3 rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">CURRENT DATABASE HASH:</span>
                  <span className="text-emerald-400 break-all font-semibold">{integrityData.currentDataHash}</span>
                </div>
                <div className="border-t border-slate-800 pt-2.5">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">BLOCKCHAIN ON-CHAIN HASH:</span>
                  <span className="text-blue-400 break-all font-semibold">{integrityData.blockchainDataHash}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIntegrityData(null)}
                className="rounded-lg bg-[#A50C1E] px-5 py-2 text-xs font-bold text-white hover:bg-red-800 transition-all cursor-pointer shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PHÓNG TO HÌNH ẢNH ================= */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative max-w-5xl overflow-hidden rounded-2xl bg-black p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-[#A50C1E] transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            <img src={selectedImage.url} alt="Di sản" className="max-h-[85vh] w-auto rounded-xl object-contain mx-auto" />
            {selectedImage.caption && (
              <p className="mt-3 text-center text-xs italic text-stone-300 px-4 pb-2 font-serif">{selectedImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
