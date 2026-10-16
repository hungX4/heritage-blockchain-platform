import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  Search,
  RefreshCw,
  Send,
  ExternalLink,
  Loader2,
  Database,
  FileCheck2,
  Lock,
  Landmark,
  ShieldAlert,
  FileText,
  Building2,
} from 'lucide-react';
import { heritageApi } from '../services/heritage.api';
import { HeritageVersion, heritageVersionApi } from '../api/heritage-version.api';
import type { Heritage } from '../types/heritage';

export function BlockchainRecordsPage() {
  const [activeTab, setActiveTab] = useState<'verified' | 'published'>('verified');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [verifiedList, setVerifiedList] = useState<Heritage[]>([]);
  const [publishedList, setPublishedList] = useState<Heritage[]>([]);

  // 1. TÍCH HỢP DEBOUNCE (400ms) CHO TÌM KIẾM
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Helper lấy version mới nhất an toàn
  const getLatestVersion = (heritage: Heritage): HeritageVersion | undefined => {
    if (!heritage.versions || heritage.versions.length === 0) return undefined;
    return [...heritage.versions].sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0))[0];
  };

  // 2. TẢI DỮ LIỆU TỪ API (Chạy khi debouncedSearch thay đổi)
  const loadData = async () => {
    setLoading(true);
    try {
      const [verifiedRes, publishedRes] = await Promise.all([
        heritageApi.list({ status: 'VERIFIED', search: debouncedSearch }),
        heritageApi.list({ status: 'PUBLISHED', search: debouncedSearch }),
      ]);

      if (verifiedRes.data?.data) {
        setVerifiedList(verifiedRes.data.data);
      }
      if (publishedRes.data?.data) {
        setPublishedList(publishedRes.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu di sản:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [debouncedSearch]);

  // 3. XỬ LÝ XUẤT BẢN ON-CHAIN
  const handlePublish = async (heritage: Heritage) => {
    const isConfirmed = window.confirm(
      `QUYẾT ĐỊNH XUẤT BẢN DI SẢN QUỐC GIA\n\n` +
      `Tên di sản: ${heritage.name}\n` +
      `Mã định danh: ${heritage.id}\n\n` +
      `Hành động này sẽ thực hiện đóng dấu niêm phong dữ liệu lên Sổ cái Điện tử (Blockchain). ` +
      `Bản ghi sau khi tạo lập sẽ có giá trị pháp lý không thể sửa đổi hoặc xóa bỏ.`
    );

    if (!isConfirmed) return;

    setPublishingId(heritage.id);
    try {
      const res = await heritageVersionApi.publish(heritage.id);

      if (res.data?.success || res.status === 201) {
        alert(`✅ XUẤT BẢN THÀNH CÔNG!\n\nMã giao dịch (TxHash): ${res.data?.data?.txHash || 'Đã ghi sổ cái'}`);
        await loadData();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Có lỗi phát sinh trong quá trình lưu bản ghi Blockchain';
      alert(`❌ KHÔNG THỂ XUẤT BẢN: ${errorMsg}`);
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 p-6 md:p-8 font-sans text-slate-800 space-y-6">
      {/* CORNER BADGE & GOV HEADER */}
      <div className="bg-white border-t-4 border-t-red-800 border-x border-b border-slate-300 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-80 text-red-800 bg-red-50 rounded-lg border border-red-200 shrink-0">
              <Landmark size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-800 uppercase tracking-widest bg-red-100/80 px-2.5 py-0.5 rounded border border-red-200">
                  Hệ thống Quản lý Dữ liệu Di sản Văn hóa
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  Mạng Sepolia Chính Thức
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1 uppercase tracking-tight">
                Sổ Cái Điện Tử & Niêm Phong Blockchain
              </h1>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                <Building2 size={13} className="text-slate-500" />
                Cơ quan vận hành: Ban Quản lý Di sản Văn hóa Quốc gia
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Cập nhật dữ liệu
          </button>
        </div>

        {/* CẢNH BÁO QUY TRÌNH HÀNH CHÍNH */}
        <div className="mt-4 bg-amber-50/80 border border-amber-300/70 rounded-md p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lưu ý nghiệp vụ:</span> Hồ sơ di sản ở trạng thái <strong className="font-semibold text-amber-800">Đã thẩm định (VERIFIED)</strong> cần thực hiện đóng dấu niêm phong On-Chain để hoàn tất thủ tục lưu trữ vĩnh viễn trên Sổ cái điện tử Quốc gia.
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hồ sơ chờ On-Chain</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1 font-mono">{verifiedList.length}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Trạng thái: VERIFIED</p>
          </div>
          <div className="p-3 bg-amber-100/60 text-amber-800 rounded-md border border-amber-200">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã niêm phong chính thức</p>
            <h3 className="text-2xl font-black text-blue-900 mt-1 font-mono">{publishedList.length}</h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <ShieldCheck size={13} /> Đảm bảo bất biến
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-900 rounded-md border border-blue-200">
            <Lock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nút ký Relay Hệ thống</p>
            <p className="text-xs font-mono font-bold text-slate-800 mt-1.5 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              0x82Fa2...3541D
            </p>
            <a
              href="https://sepolia.etherscan.io/address/0x82Fa20a3BA483541D"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-800 hover:underline mt-1.5 inline-flex items-center gap-1 font-semibold"
            >
              Tra cứu địa chỉ ký <ExternalLink size={11} />
            </a>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-md border border-slate-300">
            <Database size={22} />
          </div>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        {/* TAB BAR & DEBOUNCED SEARCH */}
        <div className="p-4 bg-slate-50 border-b border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-200/80 p-1 rounded-md border border-slate-300">
            <button
              onClick={() => setActiveTab('verified')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded transition-all ${activeTab === 'verified'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <FileCheck2 size={15} />
              DANH SÁCH CHỜ XUẤT BẢN ({verifiedList.length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded transition-all ${activeTab === 'published'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <ShieldCheck size={15} />
              ĐÃ LƯU SỔ CÁI BLOCKCHAIN ({publishedList.length})
            </button>
          </div>

          {/* Ô TÌM KIẾM CÓ TÍCH HỢP DEBOUNCE */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã di sản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 placeholder:text-slate-400"
            />
            {loading && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={14} />
            )}
          </div>
        </div>

        {/* TAB 1: DANH SÁCH CHỜ XUẤT BẢN */}
        {activeTab === 'verified' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3 text-center w-12">STT</th>
                  <th className="px-6 py-3">Tên Di Sản Văn Hóa</th>
                  <th className="px-6 py-3">Loại Hình / Lĩnh Vực</th>
                  <th className="px-6 py-3">Trạng Thái Pháp Lý</th>
                  <th className="px-6 py-3 text-right">Quyết Định Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {verifiedList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                      <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                      {debouncedSearch
                        ? `Không tìm thấy di sản nào phù hợp với từ khóa "${debouncedSearch}"`
                        : 'Hiện không có hồ sơ di sản nào ở trạng thái chờ niêm phong.'}
                    </td>
                  </tr>
                ) : (
                  verifiedList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center font-mono text-slate-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">Mã định danh: {item.id}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 font-medium">
                          {item.field?.name || 'Di sản Văn hóa'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                          <Clock size={12} /> VERIFIED (Đã Thẩm Định)
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handlePublish(item)}
                          disabled={publishingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 active:bg-blue-900 rounded shadow-sm transition-all disabled:opacity-50"
                        >
                          {publishingId === item.id ? (
                            <>
                              <Loader2 size={13} className="animate-spin" /> Đang ký số...
                            </>
                          ) : (
                            <>
                              <Send size={13} /> Xuất Bản On-Chain
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: DANH SÁCH ĐÃ NÊM PHONG ON-CHAIN */}
        {activeTab === 'published' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3 text-center w-12">STT</th>
                  <th className="px-6 py-3">Tên Di Sản Văn Hóa</th>
                  <th className="px-6 py-3">Trạng Thái Sổ Cái</th>
                  <th className="px-6 py-3">Mã Xác Thực (TxHash)</th>
                  <th className="px-6 py-3 text-right">Minh Bạch Dữ Liệu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {publishedList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                      <ShieldCheck className="mx-auto text-slate-300 mb-2" size={32} />
                      {debouncedSearch
                        ? `Không tìm thấy dữ liệu phù hợp với từ khóa "${debouncedSearch}"`
                        : 'Chưa có bản ghi di sản nào được đóng dấu lên Sổ cái điện tử.'}
                    </td>
                  </tr>
                ) : (
                  publishedList.map((item, index) => {
                    const latestVersion = getLatestVersion(item);
                    const txHash = latestVersion?.txHash;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 text-center font-mono text-slate-500 font-medium">{index + 1}</td>
                        <td className="px-6 py-3.5">
                          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">Mã định danh: {item.id}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300">
                            <ShieldCheck size={12} className="text-emerald-700" /> PUBLISHED (Đã Niêm Phong)
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          {txHash ? (
                            <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">
                              {txHash.slice(0, 10)}...{txHash.slice(-8)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Đã ghi lưu Sổ cái</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {txHash ? (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                            >
                              Soát Etherscan <ExternalLink size={11} />
                            </a>
                          ) : (
                            <a
                              href={`https://sepolia.etherscan.io/address/0x08f04Ca6B8197483E37d15371f3A3598CD892b74`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                            >
                              Kiểm tra Smart Contract <ExternalLink size={11} />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
