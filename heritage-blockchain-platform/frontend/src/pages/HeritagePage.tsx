import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Plus,
  RefreshCw,
  AlertTriangle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { heritageVersionApi } from '../api/heritage-version.api';
import { masterDataApi, HeritageField } from '../api/masterData.api';
import { HeritageVersionItem, LocationItem } from '../types/heritage';
import toast from 'react-hot-toast';
import { VIETNAM_LOCATIONS } from '../constants/location';

export function HeritagePage() {
  const [versions, setVersions] = useState<HeritageVersionItem[]>([]);
  const [fields, setFields] = useState<HeritageField[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🟢 State điều khiển Ẩn / Hiện Bảng Bộ Lọc Nổi
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // 🟢 State lọc theo Tỉnh, Huyện, Thể loại, Ngày
  const [search, setSearch] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedFieldCode, setSelectedFieldCode] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // 🟢 State Phân trang
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const ITEMS_PER_PAGE = 12;

  // Đếm số lượng bộ lọc đang được kích hoạt
  const activeFilterCount = [
    search,
    selectedProvince,
    selectedDistrict,
    selectedFieldCode,
    fromDate,
    toDate,
  ].filter(Boolean).length;

  // Fetch danh sách Loại hình Di sản từ masterDataApi
  useEffect(() => {
    const fetchHeritageFields = async () => {
      try {
        const res = await masterDataApi.getHeritageFields();
        const payload = res?.data;
        const list = Array.isArray(payload) ? payload : (payload as any)?.data || [];
        setFields(list);
      } catch (error) {
        console.error('Lỗi khi tải danh sách loại hình di sản:', error);
      }
    };
    fetchHeritageFields();
  }, []);

  // Khi thay đổi Tỉnh -> reset Huyện
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict('');
    setPage(1);
  };

  // Reset toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearch('');
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedFieldCode('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  // Fetch dữ liệu phiên bản di sản từ API Server-side
  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true);
      const locationQuery = [selectedDistrict, selectedProvince].filter(Boolean).join(', ');

      const res = await heritageVersionApi.getVersions({
        page,
        limit: ITEMS_PER_PAGE,
        search: search.trim() || undefined,
        location: locationQuery || undefined,
        fieldCode: selectedFieldCode || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      const payload: any = res?.data;

      if (payload && typeof payload === 'object' && 'items' in payload) {
        setVersions(payload.items || []);
        setTotalItems(payload.total ?? payload.items?.length ?? 0);
        setTotalPages(payload.totalPages ?? Math.ceil((payload.total ?? 1) / ITEMS_PER_PAGE));
      } else if (Array.isArray(payload)) {
        setVersions(payload);
        setTotalItems(payload.length);
        setTotalPages(Math.ceil(payload.length / ITEMS_PER_PAGE));
      } else {
        setVersions([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách di sản:', error);
      toast.error('Không thể tải danh sách di sản');
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedProvince, selectedDistrict, selectedFieldCode, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVersions();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchVersions]);

  // Helper hiển thị Tỉnh/Thành
  const renderProvince = (locations?: LocationItem[] | null) => {
    if (!locations || locations.length === 0) return 'Chưa xác định';
    const provinces = Array.from(
      new Set(locations.map((loc) => loc.province || loc.district || loc.ward).filter(Boolean))
    );
    return provinces.length > 0 ? provinces.join(', ') : 'Chưa xác định';
  };

  return (
    <div className="min-h-screen bg-black text-stone-100 p-3 sm:p-6 lg:p-8 font-sans select-none">
      <div className="flex items-center gap-2.5 pt-14">
        {/* NÚT BẤM BỘ LỌC CHÍNH (TOGGLE BỘ LỌC) */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 mb-2 text-xs font-semibold transition-all cursor-pointer ${isFilterOpen || activeFilterCount > 0
            ? 'border-gray-600 text-amber-300'
            : 'border-black bg-black hover:border-stone-700 hover:text-white'
            }`}
        >
          <SlidersHorizontal size={14} />
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#A50C1E] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>


      </div>

      {/* ================= BẢNG BỘ LỌC NỔI (MỞ KHI BẤM NÚT BỘ LỌC) ================= */}
      {isFilterOpen && (
        <div className="mb-6 rounded-xl  bg-black p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">

            {/* 1. Tìm kiếm Tên / Mã */}
            <div className="relative lg:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm theo tên di sản, mã di sản..."
                className="w-full rounded-lg border border-stone-800 bg-stone-900/90 pl-8 pr-7 py-2 text-xs text-white placeholder-stone-500 focus:border-[#A50C1E] focus:outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* 2. Dropdown Lọc Tỉnh / Thành phố */}
            <div className={`relative transition-all duration-300 ${selectedProvince ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={15} />
              <select
                value={selectedProvince}
                onChange={handleProvinceChange}
                className="w-full appearance-none rounded-lg border border-stone-800 bg-stone-900/90 pl-8 pr-7 py-2 text-xs text-white focus:border-[#A50C1E] focus:outline-none cursor-pointer"
              >
                <option value="">Tất cả Tỉnh/Thành</option>
                {Object.keys(VIETNAM_LOCATIONS).map((prov) => (
                  <option key={prov} value={prov} className="bg-stone-950 text-white">
                    {prov}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-[10px]">▼</div>
            </div>

            {/* 3. DropdownChọn Quận / Huyện */}
            {selectedProvince && (
              <div className="relative lg:col-span-2 animate-in fade-in duration-200">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" size={14} />
                <select
                  value={selectedDistrict}
                  onChange={(e) => { setSelectedDistrict(e.target.value); setPage(1); }}
                  className="w-full appearance-none rounded-lg border border-amber-400/30 bg-stone-900 pl-8 pr-7 py-2 text-xs text-amber-200 focus:border-[#A50C1E] focus:outline-none cursor-pointer"
                >
                  <option value="">Tất cả Quận/Huyện</option>
                  {VIETNAM_LOCATIONS[selectedProvince]?.map((dist) => (
                    <option key={dist} value={dist} className="bg-stone-950 text-white">
                      {dist}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300 text-[10px]">▼</div>
              </div>
            )}

            {/* 4. Dropdown Loại hình Di sản (`masterDataApi`) */}
            <div className="relative lg:col-span-3">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
              <select
                value={selectedFieldCode}
                onChange={(e) => { setSelectedFieldCode(e.target.value); setPage(1); }}
                className="w-full appearance-none rounded-lg border border-stone-800 bg-stone-900/90 pl-8 pr-7 py-2 text-xs text-white focus:border-[#A50C1E] focus:outline-none cursor-pointer"
              >
                <option value="">Tất cả Loại hình</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.code.trim()} className="bg-stone-950 text-white">
                    {f.name.trim()}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-[10px]">▼</div>
            </div>

            {/* 5. Nút Làm Mới */}
            <div className="lg:col-span-2 flex items-center justify-end">
              <button
                onClick={handleResetFilters}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 hover:bg-[#A50C1E] hover:text-white transition-all cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin text-amber-300' : ''} />
                <span>Đặt lại</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= NỘI DUNG DANH SÁCH DI SẢN (SÁT NHAU CHUẨN TRIỂN LÃM VNFAM) ================= */}
      {loading ? (
        <div className="py-24 text-center text-stone-400">
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw size={30} className="animate-spin text-[#A50C1E]" />
            <span className="text-xs font-medium text-stone-400">Đang truy vấn dữ liệu di sản số...</span>
          </div>
        </div>
      ) : versions.length === 0 ? (
        <div className="rounded-xl border border-stone-800/40 bg-black p-16 text-center text-stone-400">
          <div className="flex flex-col items-center justify-center gap-2">
            <AlertTriangle size={32} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">Không tìm thấy di sản nào phù hợp.</p>
            <p className="text-xs text-stone-500">Vui lòng thử điều chỉnh lại bộ lọc tìm kiếm.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Lưới các thẻ xếp sát nhau bằng border mờ `border-stone-800/40` */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-l border-stone-800/40 bg-black">
            {versions.map((vItem) => {
              const canonical = vItem.canonicalData;
              const heritage = canonical?.heritage;
              const field = canonical?.field;

              // Ảnh Thumbnail
              const mediaList = vItem.mediaList || vItem.media || [];
              const firstMedia = mediaList.find((m) => m.type === 'IMAGE') || mediaList[0];
              const displayImageUrl = firstMedia?.thumbnailUrl || firstMedia?.url;

              return (
                <Link
                  key={vItem.id}
                  to={`/heritages/${vItem.heritageId}`}
                  className="group flex flex-col justify-between overflow-hidden bg-black border-r border-b border-stone-800/40 transition-all duration-300 hover:border-stone-600 hover:z-10"
                >
                  <div>
                    {/* Frame Ảnh tràn lề */}
                    <div className="relative aspect-[3/3] w-full overflow-hidden bg-stone-950">
                      {displayImageUrl ? (
                        <img
                          src={displayImageUrl}
                          alt={heritage?.name || 'Di sản'}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-700">
                          <ImageIcon size={32} />
                        </div>
                      )}


                    </div>

                    {/* Khối chữ dưới nền đen mờ chuẩn VNFAM */}
                    <div className="p-4 space-y-2 bg-black">
                      <h3
                        className="font-bold text-stone-200 text-lg group-hover:text-amber-300 line-clamp-2 leading-snug transition-colors"
                        style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                      >
                        {heritage?.name || 'Chưa có tên di sản'}
                      </h3>

                      <p className="text-xs text-stone-400 leading-relaxed line-clamp-3 font-sans">
                        {canonical?.heritage?.description || canonical?.heritage.description || 'Kiệt tác di sản văn hóa phi vật thể lưu giữ giá trị nghệ thuật truyền thống độc đáo.'}
                      </p>
                    </div>
                  </div>

                  {/* Chân thẻ: Địa điểm & Chữ "Xem tiếp" chuẩn phong cách Triển lãm */}
                  <div className="px-4 pb-4 pt-1 bg-black flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-stone-500 truncate max-w-[65%]">
                      <MapPin size={11} className="text-[#A50C1E] shrink-0" />
                      <span className="truncate text-[11px] font-medium">{renderProvince(heritage?.location)}</span>
                    </div>

                    <span className="font-semibold text-xs text-[#A50C1E] group-hover:text-amber-300 transition-colors">
                      Xem tiếp
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ================= THANH PHÂN TRANG ================= */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border border-stone-800/40 bg-black p-3.5 rounded-lg">
              <span className="text-xs text-stone-400">
                Hiển thị <strong>{versions.length}</strong> / <strong>{totalItems}</strong> di sản
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1 rounded border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-[#A50C1E] hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                >
                  <ChevronLeft size={13} /> Trước
                </button>

                <span className="text-xs font-bold text-amber-300 px-2.5">
                  Trang {page} / {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="flex items-center gap-1 rounded border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-[#A50C1E] hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                >
                  Sau <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
