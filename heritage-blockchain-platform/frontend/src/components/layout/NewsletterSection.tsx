import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  X,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Vui lòng nhập địa chỉ email của bạn');
      return;
    }

    // Kiểm tra định dạng email bằng regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Địa chỉ email không hợp lệ');
      return;
    }

    setIsSubmitting(true);

    // Giả lập gửi API nhận bản tin
    setTimeout(() => {
      setIsSubmitting(false);
      setRegisteredEmail(trimmedEmail);
      setShowSuccessModal(true);
      setEmail('');
    }, 600);
  };

  return (
    <section className="w-full bg-black text-white font-sans border-t border-stone-800/80 py-14 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto space-y-10 text-center">

        {/* ================= TIÊU ĐỀ ================= */}
        <div className="space-y-2">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            Nhận bản tin
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-sans max-w-md mx-auto">
            Đăng ký để cập nhật thông tin tư liệu, sự kiện và di sản văn hóa mới nhất.
          </p>
        </div>

        {/* ================= FORM ĐĂNG KÝ ================= */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch border border-stone-700 bg-stone-950 rounded-xl overflow-hidden focus-within:border-[#A50C1E] transition-all shadow-xl">
            <div className="relative flex-1 flex items-center">
              <Mail className="absolute left-4 text-stone-500 shrink-0 pointer-events-none" size={18} />
              <input
                type="email"
                placeholder="Email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-white placeholder-stone-500 outline-none font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#A50C1E] hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Đang gửi...' : 'Đăng ký'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        {/* ================= HÀNG MẠNG XÃ HỘI ================= */}
        <div className="pt-4 border-t border-stone-800/60 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-8 text-stone-400">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="p-2.5 rounded-full bg-stone-900 border border-stone-800 hover:border-[#A50C1E] hover:text-[#A50C1E] hover:scale-110 transition-all cursor-pointer"
            >
              <Facebook size={20} />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="p-2.5 rounded-full bg-stone-900 border border-stone-800 hover:border-[#A50C1E] hover:text-[#A50C1E] hover:scale-110 transition-all cursor-pointer"
            >
              <Twitter size={20} />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="p-2.5 rounded-full bg-stone-900 border border-stone-800 hover:border-[#A50C1E] hover:text-[#A50C1E] hover:scale-110 transition-all cursor-pointer"
            >
              <Instagram size={20} />
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="p-2.5 rounded-full bg-stone-900 border border-stone-800 hover:border-[#A50C1E] hover:text-[#A50C1E] hover:scale-110 transition-all cursor-pointer"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

      </div>

      {/* ================= CỬA SỔ THÔNG BÁO THÀNH CÔNG (MODAL) ================= */}
      {showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-6 text-center text-white shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng góc trên */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>



            {/* Nội dung thông báo */}
            <div className="space-y-2">
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Đăng ký thành công!
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                Cảm ơn bạn đã đăng ký nhận bản tin di sản. Các bài viết và sự kiện nổi bật sẽ được gửi tới địa chỉ email:
              </p>
              <p className="text-sm font-mono font-bold text-white bg-black/60 py-2 px-3 rounded-lg border border-stone-800 break-all">
                {registeredEmail}
              </p>
            </div>

            {/* Nút Hoàn tất */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full rounded-xl bg-[#A50C1E] border border-amber-400/30 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-800 transition-all cursor-pointer shadow-lg"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
