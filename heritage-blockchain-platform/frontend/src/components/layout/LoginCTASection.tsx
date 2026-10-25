import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function LoginCTASection() {
  const user = useAuthStore((state) => state.user);

  // 🟢 Chỉ hiển thị khi người dùng CHƯA đăng nhập (Guest)
  if (user) return null;

  return (
    <section className="w-full bg-gradient-to-b from-black via-pink-500/30 to-[#fbfbf9] text-white font-sans py-28 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto space-y-8 text-center">

        {/* Tiêu đề & Mô tả */}
        <div className="space-y-3">
          <h2
            className="text-3xl sm:text-3xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            Bạn là thành viên?
          </h2>
        </div>

        {/* Nút bấm điều hướng */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 ">
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#A50C1E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-800 transition-all cursor-pointer shadow-lg border border-amber-400/20"
          >
            <LogIn size={16} />
            <span>Đăng nhập ngay</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/organization/request"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900/90 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-300 hover:border-stone-500 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Đăng ký tổ chức / Đơn vị</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
