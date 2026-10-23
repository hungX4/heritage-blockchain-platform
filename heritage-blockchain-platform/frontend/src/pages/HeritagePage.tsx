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
  ArrowRight,
  Filter,
  X,
  Layers,
} from 'lucide-react';
import { heritageVersionApi } from '../api/heritage-version.api';
import { masterDataApi, HeritageField } from '../api/masterData.api';
import { HeritageVersionItem, LocationItem } from '../types/heritage';
import toast from 'react-hot-toast';

// 🟢 DANH SÁCH TỈNH / THÀNH VÀ QUẬN / HUYỆN MẪU
const VIETNAM_LOCATIONS: Record<string, string[]> = {
  'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Đống Đa', 'Cầu Giấy', 'Bắc Từ Liêm', 'Nam Từ Liêm', 'Đông Anh', 'Sóc Sơn', 'Gia Lâm'],
  'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Thành phố Thủ Đức', 'Bình Thạnh', 'Tân Bình', 'Củ Chi', 'Cần Giờ'],
  'Thừa Thiên Huế': ['TP. Huế', 'Thị xã Hương Thủy', 'Thị xã Hương Trà', 'Huyện Phong Điền', 'Huyện Quảng Điền', 'Huyện Phú Vang'],
  'Bắc Ninh': ['TP. Bắc Ninh', 'Thị xã Từ Sơn', 'Huyện Yên Phong', 'Huyện Quế Võ', 'Huyện Tiên Du', 'Huyện Thuận Thành'],
  'Gia Lai': ['TP. Pleiku', 'Thị xã An Khê', 'Thị xã Ayun Pa', 'Huyện Chư Păh', 'Huyện Đăk Đoa', 'Huyện Ia Grai'],
  'Phú Thọ': ['TP. Việt Trì', 'Thị xã Phú Thọ', 'Huyện Lâm Thao', 'Huyện Phù Ninh', 'Huyện Cẩm Khê', 'Huyện Tam Nông'],
  'Quảng Nam': ['TP. Hội An', 'TP. Tam Kỳ', 'Huyện Duy Xuyên', 'Huyện Điện Bàn', 'Huyện Nam Giang'],
  'Lâm Đồng': ['TP. Đà Lạt', 'TP. Bảo Lộc', 'Huyện Lạc Dương', 'Huyện Đơn Dương', 'Huyện Đức Trọng'],
};

export function HeritagePage() {
  const [versions, setVersions] = useState<HeritageVersionItem[]>([]);
  const [fields, setFields] = useState<HeritageField[]>([]); // 🟢 State lưu danh sách loại hình từ API
  const [loading, setLoading] = useState<boolean>(true);

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

  // 🟢 Fetch danh sách Loại hình Di sản từ masterDataApi khi component mount
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
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 lg:p-10 font-sans select-none">

      {/* ================= HEADER ================= */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-stone-800 pb-4 pt-4">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-white tracking-normal flex items-center gap-2"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            <span>Kho Tàng Di Sản Văn Hóa Số</span>
            <span className="text-xs font-sans font-semibold rounded bg-[#A50C1E] px-2 py-0.5 text-amber-300">
              {totalItems} di sản
            </span>
          </h1>
        </div>

        <Link
          to="/heritage/create"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#A50C1E] border border-amber-400/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-red-800 shrink-0"
        >
          <Plus size={15} />
          <span>Đăng ký hồ sơ</span>
        </Link>
      </div>

      {/* ================= THANH TÌM KIẾM & BỘ LỌC TỈNH/HUYỆN/LOẠI HÌNH ================= */}
      <div className="mb-8 bg-stone-900/90 p-3 sm:p-4 rounded-2xl border border-stone-800 shadow-2xl backdrop-blur">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">

          {/* 1. Tìm kiếm Tên / Mã */}
          <div className="relative lg:col-span-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên, mã di sản..."
              className="w-full rounded-xl border border-stone-700 bg-stone-800/80 pl-9 pr-7 py-2 text-xs sm:text-sm text-white placeholder-stone-400 focus:border-[#A50C1E] focus:bg-stone-800 focus:outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* 2. Dropdown Lọc Tỉnh / Thành phố */}
          <div className={`relative transition-all duration-300 ${selectedProvince ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="w-full appearance-none rounded-xl border border-stone-700 bg-stone-800/80 pl-9 pr-7 py-2 text-xs sm:text-sm text-white focus:border-[#A50C1E] focus:bg-stone-800 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Tất cả Tỉnh/Thành</option>
              {Object.keys(VIETNAM_LOCATIONS).map((prov) => (
                <option key={prov} value={prov} className="bg-stone-900 text-white">
                  {prov}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▼</div>
          </div>

          {/* 3. Pop-up Dropdown Chọn Quận / Huyện */}
          {selectedProvince && (
            <div className="relative lg:col-span-2 animate-in fade-in duration-200">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" size={15} />
              <select
                value={selectedDistrict}
                onChange={(e) => { setSelectedDistrict(e.target.value); setPage(1); }}
                className="w-full appearance-none rounded-xl border border-amber-400/40 bg-stone-800 pl-9 pr-7 py-2 text-xs sm:text-sm text-amber-200 focus:border-[#A50C1E] focus:outline-none cursor-pointer"
              >
                <option value="">Tất cả Quận/Huyện</option>
                {VIETNAM_LOCATIONS[selectedProvince]?.map((dist) => (
                  <option key={dist} value={dist} className="bg-stone-900 text-white">
                    {dist}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 text-xs">▼</div>
            </div>
          )}

          {/* 4. 🟢 Dropdown Loại hình Di sản LOAD TỪ API (`masterDataApi`) */}
          <div className="relative lg:col-span-3">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <select
              value={selectedFieldCode}
              onChange={(e) => { setSelectedFieldCode(e.target.value); setPage(1); }}
              className="w-full appearance-none rounded-xl border border-stone-700 bg-stone-800/80 pl-9 pr-7 py-2 text-xs sm:text-sm text-white focus:border-[#A50C1E] focus:bg-stone-800 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Tất cả Loại hình</option>
              {fields.map((f) => (
                <option key={f.id} value={f.code.trim()} className="bg-stone-900 text-white">
                  {f.name.trim()}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">▼</div>
          </div>

          {/* 5. Nút Làm Mới & Lọc */}
          <div className="lg:col-span-2 flex items-center gap-2 justify-end">
            <button
              onClick={handleResetFilters}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-bold text-stone-300 hover:bg-[#A50C1E] hover:text-white transition-all cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-amber-300' : ''} />
              <span>Đặt lại</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= NỘI DUNG DANH SÁCH DI SẢN ================= */}
      {loading ? (
        <div className="py-24 text-center text-stone-400">
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw size={32} className="animate-spin text-[#A50C1E]" />
            <span className="text-sm font-medium">Đang tải danh sách di sản số...</span>
          </div>
        </div>
      ) : versions.length === 0 ? (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-16 text-center text-stone-400 shadow-inner">
          <div className="flex flex-col items-center justify-center gap-3">
            <AlertTriangle size={36} className="text-amber-400" />
            <p className="text-base font-semibold text-white">Không tìm thấy di sản nào phù hợp.</p>
            <p className="text-xs text-stone-400">Vui lòng thử điều chỉnh lại từ khóa hoặc bộ lọc tìm kiếm.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Grid Layout 1 Cột (Mobile), 2 Cột (Tablet), 3-4 Cột (Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  className="group flex flex-col justify-between overflow-hidden rounded-xl border border-stone-800 bg-stone-900 text-stone-200 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#A50C1E]/80 hover:shadow-2xl"
                >
                  <div>
                    {/* Frame Ảnh */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950 border-b border-stone-800">
                      {displayImageUrl ? (
                        <img
                          src={displayImageUrl}
                          alt={heritage?.name || 'Di sản'}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-600">
                          <ImageIcon size={36} />
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {field?.name && (
                          <span className="rounded bg-[#A50C1E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 shadow-md">
                            {field.name.trim()}
                          </span>
                        )}
                        {heritage?.heritageCode && (
                          <span className="rounded bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono font-bold text-white border border-white/20">
                            {heritage.heritageCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nội dung thông tin */}
                    <div className="p-5 space-y-2.5">
                      <h3
                        className="font-bold text-white text-lg group-hover:text-amber-300 line-clamp-2 leading-snug transition-colors"
                        style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                      >
                        {heritage?.name || 'Chưa có tên di sản'}
                      </h3>

                      <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                        {canonical?.heritage.description || 'Kiệt tác di sản văn hóa phi vật thể lưu giữ giá trị nghệ thuật truyền thống độc đáo.'}
                      </p>
                    </div>
                  </div>

                  {/* Chân thẻ */}
                  <div className="px-5 pb-5 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-stone-400 truncate max-w-[60%]">
                      <MapPin size={13} className="text-[#A50C1E] shrink-0" />
                      <span className="truncate font-medium">{renderProvince(heritage?.location)}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 font-bold text-[#A50C1E] group-hover:text-amber-300 group-hover:translate-x-1 transition-all">
                      <span>Xem tiếp</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ================= THANH PHÂN TRANG ================= */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-stone-800 bg-stone-900/90 p-4 rounded-xl shadow-lg">
              <span className="text-xs text-stone-400">
                Hiển thị <strong>{versions.length}</strong> / <strong>{totalItems}</strong> di sản
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-800 px-3.5 py-1.5 text-xs font-bold text-stone-300 hover:bg-[#A50C1E] hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Trước
                </button>

                <span className="text-xs font-bold text-amber-300 px-3">
                  Trang {page} / {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-800 px-3.5 py-1.5 text-xs font-bold text-stone-300 hover:bg-[#A50C1E] hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
