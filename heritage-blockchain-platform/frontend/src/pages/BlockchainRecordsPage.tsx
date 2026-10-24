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
} from 'lucide-react';
import { heritageApi } from '../services/heritage.api';
import { HeritageVersion, heritageVersionApi } from '../api/heritage-version.api';
import type { Heritage, HeritageStatus } from '../types/heritage';
import { blockchainApi, type BlockchainRecord } from '../services/blockchain.api';

export function BlockchainRecordsPage() {
  const [activeTab, setActiveTab] = useState<'verified' | 'published' | 'records'>('verified');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [verifiedList, setVerifiedList] = useState<Heritage[]>([]);
  const [publishedList, setPublishedList] = useState<Heritage[]>([]);
  const [blockchainRecords, setBlockchainRecords] = useState<BlockchainRecord[]>([]);
  const [recordsError, setRecordsError] = useState('');

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
        heritageApi.list({ status: 'VERIFIED' as HeritageStatus, search: debouncedSearch }),
        heritageApi.list({ status: 'PUBLISHED' as HeritageStatus, search: debouncedSearch }),
      ]);

      if (verifiedRes.data?.data) {
        setVerifiedList(verifiedRes.data.data);
      }
      if (publishedRes.data?.data) {
        setPublishedList(publishedRes.data.data);
      }
      try {
        const recordsRes = await blockchainApi.records();
        setBlockchainRecords(recordsRes.data.data || []);
        setRecordsError('');
      } catch (error) {
        console.error('Lỗi khi tải sổ bản ghi Blockchain:', error);
        setRecordsError('Không thể tải danh sách bản ghi Blockchain.');
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
    <div className="min-h-screen bg-[#fbfbf9] font-sans text-slate-800 pb-16">

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[88px] w-[870px] left-1/2 -translate-x-1/2 bg-[#A50C1E]" />
      {/* ================= PHẦN ĐẦU TRANG: KHỐI ĐỎ CỜ DI SẢN ================= */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">


          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/20 disabled:opacity-60 cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Đang cập nhật...' : 'Tải lại dữ liệu'}</span>
          </button>
        </div>
      </div>

      {/* ================= THÂN TRANG (BACKGROUND CANVAS TRẮNG) ================= */}
      <div className="mx-auto -mt-8 max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">

        {/* CẢNH BÁO QUY TRÌNH HÀNH CHÍNH */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
          <ShieldAlert size={16} className="text-[#A50C1E] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lưu ý nghiệp vụ:</span> Hồ sơ di sản ở trạng thái <strong className="font-bold text-[#A50C1E]">VERIFIED (Đã thẩm định)</strong> cần được thực hiện đóng dấu niêm phong On-Chain để hoàn tất thủ tục lưu trữ vĩnh viễn trên Sổ cái điện tử.
          </div>
        </div>

        {/* THỐNG KÊ THÔNG TIN BẢN GHI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hồ sơ chờ On-Chain</p>
              <h3
                className="text-2xl sm:text-3xl font-bold text-[#A50C1E] mt-1 tracking-tight"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                {verifiedList.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Trạng thái: VERIFIED</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đã niêm phong chính thức</p>
              <h3
                className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                {publishedList.length}
              </h3>
              <p className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                <ShieldCheck size={13} /> Bất biến trên Blockchain
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              <Lock size={22} />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nút ký Relay Hệ thống</p>
              <p className="text-xs font-mono font-bold text-slate-800 mt-2 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                0x82Fa2...3541D
              </p>
              <a
                href="https://sepolia.etherscan.io/address/0x82Fa20a3BA483541D"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#A50C1E] hover:underline mt-1.5 inline-flex items-center gap-1 font-bold"
              >
                Tra cứu địa chỉ ký <ExternalLink size={11} />
              </a>
            </div>
            <div className="p-3 bg-stone-100 text-slate-700 rounded-xl border border-stone-200">
              <Database size={22} />
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU CHÍNH */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          {/* THANH CHUYỂN TAB VÀ Ô TÌM KIẾM */}
          <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('verified')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'verified'
                  ? 'bg-[#A50C1E] text-white shadow-xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                  }`}
              >
                <FileCheck2 size={14} />
                <span>CHỜ XUẤT BẢN ({verifiedList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('published')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'published'
                  ? 'bg-[#A50C1E] text-white shadow-xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                  }`}
              >
                <ShieldCheck size={14} />
                <span>ĐÃ NÊM PHONG ({publishedList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'records'
                  ? 'bg-[#A50C1E] text-white shadow-xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                  }`}
              >
                <Database size={14} />
                <span>BẢN GHI ON-CHAIN ({blockchainRecords.length})</span>
              </button>
            </div>

            {/* TÌM KIẾM CÓ DEBOUNCE */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã di sản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-stone-300 rounded-full focus:outline-none focus:border-[#A50C1E] text-slate-800 placeholder-slate-400"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={14} />
              )}
            </div>
          </div>

          {/* TAB 1: DANH SÁCH CHỜ XUẤT BẢN */}
          {activeTab === 'verified' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-100 text-[11px] font-bold uppercase text-slate-700 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">STT</th>
                    <th className="px-6 py-3">Tên Di Sản Văn Hóa</th>
                    <th className="px-6 py-3">Loại Hình / Lĩnh Vực</th>
                    <th className="px-6 py-3">Trạng Thái Thẩm Định</th>
                    <th className="px-6 py-3 text-right">Quyết Định Thẩm Định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {verifiedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-stone-50/50">
                        <FileText className="mx-auto text-stone-300 mb-2" size={32} />
                        {debouncedSearch
                          ? `Không tìm thấy di sản nào phù hợp với từ khóa "${debouncedSearch}"`
                          : 'Hiện không có hồ sơ di sản nào ở trạng thái chờ niêm phong.'}
                      </td>
                    </tr>
                  ) : (
                    verifiedList.map((item, index) => (
                      <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3.5 text-center font-mono text-slate-400 font-medium">{index + 1}</td>
                        <td className="px-6 py-3.5">
                          <div
                            className="font-bold text-slate-900 text-sm"
                            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                          >
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Mã định danh: {item.id}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-block bg-stone-100 text-slate-700 px-2.5 py-1 rounded-md border border-stone-200 font-medium">
                            {item.field?.name || 'Di sản Văn hóa'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            <Clock size={12} /> VERIFIED (Đã Thẩm Định)
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handlePublish(item)}
                            disabled={publishingId === item.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#A50C1E] hover:bg-red-800 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
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

          {/* TAB 2: DANH SÁCH ĐÃ NIÊM PHONG ON-CHAIN */}
          {activeTab === 'published' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-100 text-[11px] font-bold uppercase text-slate-700 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">STT</th>
                    <th className="px-6 py-3">Tên Di Sản Văn Hóa</th>
                    <th className="px-6 py-3">Trạng Thái Sổ Cái</th>
                    <th className="px-6 py-3">Mã Xác Thực (TxHash)</th>
                    <th className="px-6 py-3 text-right">Minh Bạch Dữ Liệu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {publishedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-stone-50/50">
                        <ShieldCheck className="mx-auto text-stone-300 mb-2" size={32} />
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
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3.5 text-center font-mono text-slate-400 font-medium">{index + 1}</td>
                          <td className="px-6 py-3.5">
                            <div
                              className="font-bold text-slate-900 text-sm"
                              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                            >
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Mã định danh: {item.id}</div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                              <ShieldCheck size={12} className="text-emerald-700" /> PUBLISHED (Đã Niêm Phong)
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            {txHash ? (
                              <span className="font-mono text-[11px] bg-stone-100 text-slate-800 px-2 py-1 rounded-md border border-stone-200">
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
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#A50C1E] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                              >
                                Soát Etherscan <ExternalLink size={11} />
                              </a>
                            ) : (
                              <a
                                href={`https://sepolia.etherscan.io/address/0x08f04Ca6B8197483E37d15371f3A3598CD892b74`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
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

          {/* TAB 3: BẢN GHI ON-CHAIN KHÁCH QUAN */}
          {activeTab === 'records' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs text-slate-700">
                <thead className="border-b border-stone-200 bg-stone-100 text-[11px] font-bold uppercase text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Di sản</th>
                    <th className="px-4 py-3">Phiên bản</th>
                    <th className="px-4 py-3">Data hash</th>
                    <th className="px-4 py-3">Người xác thực</th>
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3">Block</th>
                    <th className="px-4 py-3">Thời gian ghi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {loading ? (
                    <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">Đang tải bản ghi...</td></tr>
                  ) : recordsError ? (
                    <tr><td colSpan={7} className="px-6 py-10 text-center text-rose-700">{recordsError}</td></tr>
                  ) : blockchainRecords.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">Backend hiện chưa trả về bản ghi Blockchain nào.</td></tr>
                  ) : blockchainRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <div
                          className="font-bold text-slate-900"
                          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                        >
                          {record.heritage?.name || record.heritageId}
                        </div>
                        {record.heritage?.heritageCode && <div className="mt-0.5 font-mono text-[10px] text-slate-500">{record.heritage.heritageCode}</div>}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">v{record.version}</td>
                      <td className="max-w-56 truncate px-4 py-3 font-mono text-emerald-800 font-semibold" title={record.dataHash}>{record.dataHash}</td>
                      <td className="px-4 py-3">{record.verifier || '—'}</td>
                      <td className="px-4 py-3">
                        {record.transactionHash ? (
                          <a href={`https://sepolia.etherscan.io/tx/${record.transactionHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[#A50C1E] font-semibold hover:underline">
                            {record.transactionHash.slice(0, 10)}…{record.transactionHash.slice(-8)} <ExternalLink size={11} />
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono">{record.blockNumber ?? '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{record.createdAt ? new Date(record.createdAt).toLocaleString('vi-VN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
