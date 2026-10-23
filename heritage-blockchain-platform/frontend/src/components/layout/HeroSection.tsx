import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeritageSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  unescoTag: string;
}

const HERITAGE_SLIDES: HeritageSlide[] = [
  {
    id: 1,
    title: 'Không Gian Văn Hóa Cồng Chiêng',
    subtitle: 'Âm thanh linh thiêng giữa đại ngàn Tây Nguyên',
    description:
      'Kiệt tác truyền khẩu gắn liền với đời sống tâm linh, lễ hội và tín ngưỡng truyền thống của các dân tộc Tây Nguyên.',
    imageUrl: 'https://live.staticflickr.com/4615/39085488734_ff247407a2_b.jpg',
    unescoTag: 'UNESCO 2005',
  },
  {
    id: 2,
    title: 'Dân Ca Quan Họ Bắc Ninh',
    subtitle: 'Làn điệu trữ tình xứ Kinh Bắc',
    description:
      'Nghệ thuật ca hát dân gian đối đáp mộc mạc, thể hiện tình cảm gắn kết sâu sắc và nét văn hóa giao duyên thanh lịch.',
    imageUrl: 'https://mgimagazine.com/uploads/30%20thang%203/quan%20h%E1%BB%8D/t4a-12-20231011212057.jpg',
    unescoTag: 'UNESCO 2009',
  },
  {
    id: 3,
    title: 'Nhã Nhạc Cung Đình Huế',
    subtitle: 'Âm nhạc triều đình phong kiến Việt Nam',
    description:
      'Loại hình âm nhạc bác học kết hợp giữa nghi lễ và nghệ thuật đỉnh cao, đại diện cho bản sắc văn hóa cố đô.',
    imageUrl: 'https://thethaovanhoa.mediacdn.vn/372676912336973824/2025/6/23/vnapotalnhanhaccungdinhhuehondisantrongtungnhipphach8107873-1750652403858351239428.jpg',
    unescoTag: 'UNESCO 2003',
  },
  {
    id: 4,
    title: 'Đờn Ca Tài Tử Nam Bộ',
    subtitle: 'Giai điệu mộc mạc vùng sông nước Cửu Long',
    description:
      'Nghệ thuật đàn và hát dân gian đặc sắc được sáng tạo từ nền âm nhạc lễ nghi, thể hiện nét văn hóa phương Nam.',
    imageUrl: 'https://baodongnai.com.vn/file/e7837c02876411cd0187645a2551379f/112024/11_20241101190515.jpg',
    unescoTag: 'UNESCO 2013',
  },
  {
    id: 5,
    title: 'Hát Xoan Phú Thọ',
    subtitle: 'Giai điệu kết nối cội nguồn Đất Tổ',
    description:
      'Loại hình dân ca lễ nghi hát trước đình làng vào dịp xuân về, gắn liền với tín ngưỡng thờ cúng Hùng Vương.',
    imageUrl: 'https://divungtau.com/wp-content/uploads/2026/06/hat-xoan-phu-tho-di-san-van-hoa-phi-vat-the-dai-dien-cho-nhan-loai.jpg',
    unescoTag: 'UNESCO 2011',
  },
  {
    id: 6,
    title: 'Vũ Điệu Xòe Thái',
    subtitle: 'Vũ điệu đoàn kết gắn kết cộng đồng Tây Bắc',
    description:
      'Nghệ thuật trình diễn múa dân gian đặc sắc, biểu tượng cho sự gắn kết và lòng hiếu khách của đồng bào dân tộc Thái.',
    imageUrl: 'https://dbnd.1cdn.vn/2022/12/24/ee7c73260bf68c6f6e7d79b065ca9de9cdc7f66005505a84ccedfe722b71135366c523369ebf-__308562315_3196768857249667_7824-1671790578714.jpg',
    unescoTag: 'UNESCO 2021',
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERITAGE_SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + HERITAGE_SLIDES.length) % HERITAGE_SLIDES.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-stone-950 text-white font-sans select-none">
      {HERITAGE_SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            {/* Ảnh Nền Full Screen */}
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="h-full w-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
            />

            {/* Lớp phủ Gradient làm tối góc trái để chữ luôn rõ ràng */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/15 to-transparent" />

            {/* Cụm nội dung Slider */}
            <div className="absolute inset-0 flex items-center pt-20 sm:pt-28">
              <div className="mx-auto max-w-6xl w-full px-6 sm:px-12">
                {/* 🟢 GIỚI HẠN CHIỀU RỘNG KHỐI CHỮ CHỈ TỪ 40% ĐẾN 45% MÀN HÌNH */}
                <div className="w-full md:w-[45%] lg:w-[42%] space-y-3 sm:space-y-4">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 rounded bg-[#A50C1E] border border-amber-300/40 px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider shadow-md">
                    <Sparkles size={13} />
                    <span>{slide.unescoTag}</span>
                  </div>

                  {/* Tiêu đề di sản - co giãn vừa vặn trong 40-45% */}
                  <h2
                    className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-md tracking-normal"
                    style={{
                      fontFamily: "'Merriweather', Georgia, serif",
                      lineHeight: "1.4" // 👈 Chỉnh số này: 1.35 (giãn nhẹ), 1.4 (vừa đẹp), 1.5 (giãn rộng hẳn)
                    }}
                  >
                    {slide.title.normalize('NFC')}
                  </h2>

                  {/* Subtitle */}
                  <p
                    className="text-xs sm:text-sm lg:text-base font-semibold text-amber-200/90 leading-normal"
                    style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                  >
                    {slide.subtitle.normalize('NFC')}
                  </p>

                  {/* Mô tả ngắn */}
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-3">
                    {slide.description.normalize('NFC')}
                  </p>

                  {/* Nút Khám phá */}
                  <div className="pt-2">
                    <Link
                      to="/heritage/list"
                      className="inline-flex items-center gap-2 rounded bg-[#A50C1E] border border-amber-400/30 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl transition-all hover:bg-red-800 hover:gap-3"
                    >
                      <span>Khám phá thêm</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Nút chuyển Slide Trái / Phải */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/80 border border-white/20 transition-all hover:bg-[#A50C1E] hover:text-white hover:scale-110 focus:outline-none"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/80 border border-white/20 transition-all hover:bg-[#A50C1E] hover:text-white hover:scale-110 focus:outline-none"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Nút số chuyển slide (1) (2) (3) (4) (5) (6) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERITAGE_SLIDES.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${isActive
                ? 'bg-[#A50C1E] text-white border-2 border-amber-300 scale-110 shadow-lg'
                : 'bg-black/60 text-white/70 border border-white/30 hover:bg-black/90 hover:text-white'
                }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </section>
  );
}
