import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Blocks,
  ShieldCheck,
  ChevronRight,
  Globe,
  Award,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white text-black font-sans  select-none">
      {/* ================= TẦNG TRÊN: NỘI DUNG CHÍNH ================= */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* CỘT 1: LOGO & GIỚI THIỆU */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-14 items-center justify-center border-2 border-white bg-[#A50C1E] p-1 shadow-md transition-transform group-hover:scale-105">
                <svg
                  viewBox="0 0 100 65"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-9 w-11 text-white"
                >
                  <path d="M 10 25 L 50 10 L 90 25" />
                  <path d="M 20 25 L 50 14 L 80 25" />
                  <path d="M 20 25 L 20 55 L 80 55 L 80 25" />
                  <rect x="26" y="32" width="10" height="23" />
                  <rect x="45" y="32" width="10" height="23" />
                  <rect x="64" y="32" width="10" height="23" />
                </svg>
              </div>

              <div className="flex flex-col font-serif leading-none text-black">
                <span className="text-lg font-black tracking-widest border-b border-amber-500/40 pb-0.5">
                  VIET NAM
                </span>
                <span className="text-[10px] font-bold tracking-widest pt-1 uppercase text-black">
                  HERITAGE
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-400 leading-relaxed">
              Hệ thống lưu trữ & thẩm định Di sản Văn hóa Phi vật thể Việt Nam trên nền tảng công nghệ Blockchain, tôn vinh và bảo tồn bản sắc dân tộc.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-300">
              <ShieldCheck size={16} className="text-[#A50C1E]" />
              <span>Thẩm định số bằng Blockchain</span>
            </div>
          </div>

          {/* CỘT 2: LIÊN KẾT NHANH */}
          <div className="space-y-3">
            <h4
              className="text-sm font-bold uppercase tracking-wider text-black border-b border-white/10 pb-2 inline-block"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Điều hướng
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="flex items-center gap-1.5 transition-colors hover:text-[#A50C1E] hover:translate-x-1 duration-200">
                  <ChevronRight size={13} className="text-[#A50C1E]" />
                  <span>Giới thiệu nền tảng</span>
                </Link>
              </li>
              <li>
                <Link to="/heritage/list" className="flex items-center gap-1.5 transition-colors hover:text-[#A50C1E] hover:translate-x-1 duration-200">
                  <ChevronRight size={13} className="text-[#A50C1E]" />
                  <span>Danh mục Di sản</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="flex items-center gap-1.5 transition-colors hover:text-[#A50C1E] hover:translate-x-1 duration-200">
                  <ChevronRight size={13} className="text-[#A50C1E]" />
                  <span>Sự kiện văn hóa</span>
                </Link>
              </li>
              <li>
                <Link to="/heritage/create" className="flex items-center gap-1.5 transition-colors hover:text-[#A50C1E] hover:translate-x-1 duration-200">
                  <ChevronRight size={13} className="text-[#A50C1E]" />
                  <span>Lập hồ sơ Di sản</span>
                </Link>
              </li>
              <li>
                <Link to="/organization/request" className="flex items-center gap-1.5 transition-colors hover:text-[#A50C1E] hover:translate-x-1 duration-200">
                  <ChevronRight size={13} className="text-[#A50C1E]" />
                  <span>Đăng ký Đơn vị / Tổ chức</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: DI SẢN TIÊU BIỂU */}
          <div className="space-y-3">
            <h4
              className="text-sm font-bold uppercase tracking-wider text-black border-b border-white/10 pb-2 inline-block"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Di sản Tiêu biểu
            </h4>

            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-black">
                <Award size={13} className="text-black shrink-0" />
                <span className="truncate">Nhã Nhạc Cung Đình Huế</span>
              </li>
              <li className="flex items-center gap-2 text-black">
                <Award size={13} className="text-black shrink-0" />
                <span className="truncate">Cồng Chiêng Tây Nguyên</span>
              </li>
              <li className="flex items-center gap-2 text-black">
                <Award size={13} className="text-black shrink-0" />
                <span className="truncate">Dân Ca Quan Họ Bắc Ninh</span>
              </li>
              <li className="flex items-center gap-2 text-black">
                <Award size={13} className="text-black shrink-0" />
                <span className="truncate">Đờn Ca Tài Tử Nam Bộ</span>
              </li>
              <li className="flex items-center gap-2 text-black">
                <Award size={13} className="text-black shrink-0" />
                <span className="truncate">Hát Xoan Phú Thọ</span>
              </li>
            </ul>
          </div>

          {/* CỘT 4: THÔNG TIN LIÊN HỆ */}
          <div className="space-y-3">
            <h4
              className="text-sm font-bold uppercase tracking-wider text-black border-b border-white/10 pb-2 inline-block"
              style={{ fontFamily: "'Merriweather', Georgia, serif" }}
            >
              Thông tin Liên hệ
            </h4>

            <div className="space-y-2.5 text-xs text-black">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#A50C1E] mt-0.5 shrink-0" />
                <span>Số 66 Nguyễn Thái Học, Ba Đình, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#A50C1E] shrink-0" />
                <span>+84 (024) 3733 2252</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#A50C1E] shrink-0" />
                <span>contact@vietnamheritage.gov.vn</span>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Blocks size={15} className="text-[#A50C1E] shrink-0" />
                <span className="text-[11px] text-black">Node Sổ cái: #0x8F...A92</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= TẦNG DƯỚI: BẢO QUYỀN & CHÍNH SÁCH ================= */}
      <div className="bg-white border-t border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-[11px] text-black sm:flex-row">
          <p>© {new Date().getFullYear()} VIET NAM HERITAGE. Tất cả quyền được bảo lưu.</p>

          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-amber-300 hover:underline">
              Điều khoản sử dụng
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-amber-300 hover:underline">
              Chính sách bảo mật
            </Link>
            <span>•</span>
            <Link to="/blockchain" className="hover:text-amber-300 hover:underline flex items-center gap-1">
              <Globe size={11} /> Blockchain Explorer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
