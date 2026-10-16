import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  Building,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Music,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Copy,
  Check,
  Tag,
  Hash,
  FileText,
  FileCode,
  Globe,
} from 'lucide-react';
import { heritageVersionApi } from '../api/heritage-version.api';
import { integrityApi } from '../api/integrity.api';
import {
  HeritageVersionItem,
  HeritageIntegrityResult,
  LocationItem,
  HeritageVersionMedia,
} from '../types/heritage';
import toast from 'react-hot-toast';

export function HeritageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [versionData, setVersionData] = useState<HeritageVersionItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State cho Modal Integrity Check & Modal Xem ảnh
  const [verifying, setVerifying] = useState<boolean>(false);
  const [integrityData, setIntegrityData] = useState<HeritageIntegrityResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption?: string } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Tải chi tiết phiên bản di sản
  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await heritageVersionApi.getVersionById(id);
      if (res.data) {
        setVersionData(res.data);
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

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Kiểm tra tính toàn vẹn dữ liệu qua Blockchain API
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

  // Helper sao chép
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast.success('Đã sao chép');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Helper hiển thị địa điểm (Xã, Huyện, Tỉnh)
  const renderLocations = (locations?: LocationItem[] | null) => {
    if (!locations || locations.length === 0) return 'Chưa có thông tin';
    return locations
      .map((loc) => [loc.ward, loc.district, loc.province].filter(Boolean).join(', '))
      .join('; ');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbf9]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={32} className="animate-spin text-emerald-800" />
          <p className="text-sm font-medium text-slate-600">Đang tải thông tin hồ sơ di sản...</p>
        </div>
      </div>
    );
  }

  if (!versionData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbfbf9] p-6 text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy di sản</h2>
        <p className="mt-1 text-sm text-slate-500">Hồ sơ di sản có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
        <button
          onClick={() => navigate('/heritage/list')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const canonical = versionData.canonicalData;
  const heritage = canonical?.heritage;
  const field = canonical?.field;

  // Tổng hợp media từ mediaList hoặc media của versionData / canonicalData
  const mediaList: HeritageVersionMedia[] =
    versionData.mediaList ||
    versionData.media ||
    canonical?.media ||
    [];

  // Phân loại Media
  const images = mediaList.filter((m) => m.type?.toUpperCase() === 'IMAGE');
  const videos = mediaList.filter((m) => m.type?.toUpperCase() === 'VIDEO');
  const audios = mediaList.filter((m) => m.type?.toUpperCase() === 'AUDIO');

  return (
    <div className="min-h-screen bg-[#fbfbf9] p-4 sm:p-6 font-sans text-slate-800">
      {/* Header Điều Hướng */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        {/* Nút Xác thực Blockchain Integrity */}
        <button
          onClick={handleCheckIntegrity}
          disabled={verifying}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-900 disabled:opacity-50"
        >
          <ShieldCheck size={18} />
          {verifying ? 'Đang xác thực Integrity...' : 'Xác thực Toàn vẹn Blockchain'}
        </button>
      </div>

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Card Tổng Quan */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {field?.name && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <Tag size={12} /> {field.name}
                </span>
              )}
              {heritage?.heritageCode && (
                <span className="inline-flex items-center gap-1 rounded bg-stone-100 border border-stone-200 px-2 py-0.5 text-xs font-mono font-medium text-slate-700">
                  Mã: {heritage.heritageCode}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-mono font-medium text-white">
                v{versionData.version}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {heritage?.name || 'Chưa có tên di sản'}
            </h1>
          </div>

          {/* Lưới Thông Tin Cơ Bản */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 border-t border-stone-100 pt-5 text-sm">
            {/* Địa điểm */}
            <div className="flex items-start gap-2.5">
              <MapPin size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Địa điểm / Địa giới hành chính</p>
                <p className="font-semibold text-slate-800 mt-0.5">{renderLocations(heritage?.location)}</p>
              </div>
            </div>

            {/* Thời điểm ghi danh */}
            <div className="flex items-start gap-2.5">
              <Calendar size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Thời điểm ghi danh</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {heritage?.recognizedAt
                    ? new Date(heritage.recognizedAt).toLocaleDateString('vi-VN')
                    : 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {/* Đơn vị & Nguồn tư liệu */}
            <div className="flex items-start gap-2.5">
              <Building size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Nguồn / Đơn vị quản lý</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {heritage?.sourceOrganization || 'Chưa cập nhật'}
                </p>
                {heritage?.source && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nguồn gốc: <span className="text-slate-700 font-medium">{heritage.source}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin Văn bản Pháp lý gốc & Link IPFS (nếu có) */}
          {(heritage?.sourceDocumentNumber || heritage?.sourceUrl || heritage?.sourceDocumentCid) && (
            <div className="mt-5 rounded-xl bg-stone-50 p-4 border border-stone-200/80 text-xs space-y-2">
              <p className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <FileCode size={15} className="text-emerald-700" /> Văn bản Hồ sơ / Pháp lý đính kèm:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                {heritage.sourceDocumentNumber && (
                  <p>
                    <span className="font-medium text-slate-700">Số hiệu văn bản:</span> {heritage.sourceDocumentNumber}
                  </p>
                )}
                {heritage.sourceDocumentCid && (
                  <p className="font-mono truncate">
                    <span className="font-sans font-medium text-slate-700">IPFS CID:</span> {heritage.sourceDocumentCid}
                  </p>
                )}
                {heritage.sourceUrl && (
                  <div className="sm:col-span-2">
                    <a
                      href={heritage.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-emerald-800 hover:underline"
                    >
                      <Globe size={13} /> Truy cập liên kết văn bản tư liệu gốc <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Nội dung Mô tả Chi tiết */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText size={18} className="text-emerald-800" /> Mô tả chi tiết di sản
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line border-t border-stone-100 pt-3">
            {heritage?.description || 'Chưa có thông tin mô tả chi tiết cho di sản này.'}
          </div>
        </div>

        {/* --- KHU VỰC MEDIA (CHỈ HIỂN THỊ KHI CÓ DỮ LIỆU) --- */}

        {/* 1. THƯ VIỆN HÌNH ẢNH */}
        {images.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon size={18} className="text-emerald-800" />
              Thư viện Hình ảnh tư liệu ({images.length})
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, idx) => {
                // Đảm bảo imgUrl luôn luôn là kiểu string để không bị lỗi TypeScript undefined
                const imgUrl = img.url || img.thumbnailUrl || '';
                return (
                  <div
                    key={img.id || idx}
                    onClick={() => setSelectedImage({ url: imgUrl, caption: img.caption })}
                    className="group relative aspect-4/3 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 cursor-pointer shadow-xs hover:border-emerald-600 transition-all"
                  >
                    <img
                      src={imgUrl}
                      alt={img.caption || heritage?.name || 'Hình ảnh di sản'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[11px] text-white truncate">
                        {img.caption}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. VIDEO TƯ LIỆU */}
        {videos.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Video size={18} className="text-emerald-800" />
              Video Tư liệu ({videos.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((vid, idx) => (
                <div key={vid.id || idx} className="overflow-hidden rounded-xl border border-stone-200 bg-black">
                  <video
                    controls
                    src={vid.url}
                    poster={vid.thumbnailUrl}
                    className="w-full aspect-video object-contain"
                  >
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                  </video>
                  {vid.caption && (
                    <div className="p-3 bg-stone-900 text-slate-200 text-xs">
                      <p className="text-slate-300">{vid.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BẢN GHI ÂM (AUDIO) */}
        {audios.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Music size={18} className="text-emerald-800" />
              Tư liệu Âm thanh & Thuyết minh ({audios.length})
            </h2>

            <div className="space-y-3">
              {audios.map((aud, idx) => (
                <div
                  key={aud.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-stone-200 bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                      <Music size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {aud.caption || `Bản ghi âm tư liệu #${idx + 1}`}
                      </p>
                      {aud.cid && <p className="text-xs font-mono text-slate-400 mt-0.5">CID: {aud.cid}</p>}
                    </div>
                  </div>

                  <audio controls src={aud.url} className="w-full sm:w-72 h-10">
                    Trình duyệt không hỗ trợ thẻ audio.
                  </audio>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Khối Thông tin Hash Xác thực Blockchain */}
        <div className="rounded-2xl border border-stone-200 bg-slate-900 p-6 text-slate-300 shadow-sm font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400 font-sans border-b border-slate-800 pb-3">
            <span className="font-bold flex items-center gap-1.5 text-white">
              <Hash size={16} className="text-emerald-400" /> Thông tin Bản ghi Hash Blockchain
            </span>
            <span>Version #{versionData.version}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Data Hash (SHA-256):</span>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="truncate text-emerald-400">{versionData.dataHash || '—'}</span>
              {versionData.dataHash && (
                <button
                  onClick={() => handleCopy(versionData.dataHash!)}
                  className="text-slate-400 hover:text-white shrink-0"
                >
                  {copiedHash === versionData.dataHash ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>

          {versionData.blockchainTxHash && (
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-500 block text-[10px] uppercase">Transaction Hash:</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${versionData.blockchainTxHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:underline truncate mt-0.5"
              >
                {versionData.blockchainTxHash} <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL HIỂN THỊ KẾT QUẢ INTEGRITY CHECK --- */}
      {integrityData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full ${integrityData.integrityValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                >
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kết Quả Xác Thực Toàn Vẹn Dữ Liệu
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phiên bản v{integrityData.version} • {new Date(integrityData.verifiedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIntegrityData(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-stone-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div
                className={`flex items-center gap-3 rounded-xl border p-4 ${integrityData.integrityValid
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50/50 text-rose-900'
                  }`}
              >
                {integrityData.integrityValid ? (
                  <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={24} className="text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-xs uppercase tracking-wide">
                    {integrityData.integrityValid
                      ? 'Dữ liệu đảm bảo toàn vẹn tuyệt đối'
                      : 'Cảnh báo: Dữ liệu bị thay đổi bất hợp lệ'}
                  </p>
                  <p className="text-xs mt-0.5 text-slate-600">
                    {integrityData.integrityValid
                      ? 'Mã Hash dữ liệu hiện tại hoàn toàn khớp với bản ghi On-Chain Blockchain.'
                      : 'Dữ liệu trong Database có dấu hiệu bị can thiệp sai lệch so với Smart Contract.'}
                  </p>
                </div>
              </div>

              {/* Chi tiết Hash so sánh */}
              <div className="space-y-2 rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">CURRENT DATA HASH:</span>
                  <span className="text-emerald-400 break-all">{integrityData.currentDataHash}</span>
                </div>
                <div className="border-t border-slate-800 pt-2">
                  <span className="text-slate-500 block text-[10px]">BLOCKCHAIN ON-CHAIN HASH:</span>
                  <span className="text-blue-400 break-all">{integrityData.blockchainDataHash}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIntegrityData(null)}
                className="rounded-lg bg-stone-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-stone-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PHÓNG TO ẢNH --- */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div className="relative max-w-4xl overflow-hidden rounded-xl bg-black p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
            >
              <X size={20} />
            </button>
            <img src={selectedImage.url} alt="Di sản" className="max-h-[85vh] w-auto rounded object-contain mx-auto" />
            {selectedImage.caption && (
              <p className="mt-2 text-center text-xs italic text-slate-300">{selectedImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
