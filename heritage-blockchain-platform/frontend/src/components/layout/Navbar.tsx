import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  Blocks,
  FolderCog,
  Users,
  Layers,
  Award,
  Building2,
  CheckSquare,
  FilePlus,
  LogOut,
  Search,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';

export function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isManagementRole = Boolean(user?.role && user.role !== 'USER');
  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/heritage/list?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 font-sans select-none flex justify-center pointer-events-none">
      {/* 🟢 KHUNG NAVBAR TRONG SUỐT (GLASSMORPHISM) */}
      <div className="pointer-events-auto flex w-fit max-w-6xl items-stretch bg-black/10 text-white shadow-2xl transition-all duration-300">

        {/* ================= CỘT 1: LOGO VNFAM ================= */}
        <NavLink
          to="/"
          className="flex items-center gap-3.5 border-white/20 bg-transparent px-6 py-3 transition-colors duration-300 hover:bg-[#A50C1E] shrink-0"
        >
          <div className="flex h-12 w-16 items-center justify-center p-1">
            <svg
              viewBox="0 0 100 65"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-12 text-white"
            >
              <path d="M 10 25 L 50 10 L 90 25" />
              <path d="M 20 25 L 50 14 L 80 25" />
              <path d="M 20 25 L 20 55 L 80 55 L 80 25" />
              <rect x="26" y="32" width="10" height="23" />
              <rect x="45" y="32" width="10" height="23" />
              <rect x="64" y="32" width="10" height="23" />
            </svg>
          </div>

          <div className="flex flex-col font-serif leading-none text-white">
            <span className="text-xl font-black tracking-widest border-b border-white/40 pb-0.5">
              VIET NAM
            </span>
            <span className="text-[11px] text-center font-bold tracking-widest pt-2 uppercase">
              Heritage
            </span>
          </div>
        </NavLink>

        {/* ================= CỘT 2: CỘT GIỮA MENU ================= */}
        <div className="flex flex-col justify-between">

          {/* Ô TÌM KIẾM */}
          <div className="flex items-center justify-center px-4 h-11 w-full">
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <input
                type="text"
                placeholder="Tìm kiếm di sản, sự kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-white/10 py-1.5 pl-4 pr-10 text-xs text-white placeholder-white/70 hover:bg-[#A50C1E]/70 focus:bg-[#A50C1E] focus:border-amber-300 focus:outline-none transition-all duration-300 shadow-inner"
              />
              <button type="submit" className="absolute right-3.5 text-white/80 hover:text-amber-300 focus:outline-none cursor-pointer">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* MENU CHÍNH */}
          <nav className="flex items-center justify-center gap-2 sm:gap-4 px-3 h-11 font-bold text-xs sm:text-sm tracking-wider uppercase whitespace-nowrap">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-all duration-300 hover:bg-[#A50C1E] ${isActive ? 'bg-[#A50C1E] text-amber-300 font-extrabold shadow-sm' : 'text-white'
                }`
              }
            >
              Giới thiệu
            </NavLink>

            <NavLink
              to="/heritage/list"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-all duration-300 hover:bg-[#A50C1E] ${isActive ? 'bg-[#A50C1E] text-amber-300 font-extrabold shadow-sm' : 'text-white'
                }`
              }
            >
              Danh mục
            </NavLink>

            <NavLink
              to="/events"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-all duration-300 hover:bg-[#A50C1E] ${isActive ? 'bg-[#A50C1E] text-amber-300 font-extrabold shadow-sm' : 'text-white'
                }`
              }
            >
              Sự kiện
            </NavLink>

            <NavLink
              to="/heritage/create"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-all duration-300 hover:bg-[#A50C1E] ${isActive ? 'bg-[#A50C1E] text-amber-300 font-extrabold shadow-sm' : 'text-white'
                }`
              }
            >
              Lập hồ sơ di sản
            </NavLink>
          </nav>

        </div>

        {/* ================= CỘT 3: CỘT KHUNG CỐ ĐỊNH GIỮ NGUYÊN CHIỀU DÀI NAVBAR ================= */}
        <div
          className={`flex items-center justify-center px-6 shrink-0 relative transition-colors duration-300 ${user ? 'hover:bg-[#A50C1E]' : ''
            }`}
          ref={dropdownRef}
        >
          {user && (
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white font-bold text-sm shadow-md transition-all hover:scale-105 hover:bg-white/30 hover:border-amber-300 focus:outline-none cursor-pointer"
                title={`${user?.fullName} (${user?.role})`}
              >
                {user?.fullName?.charAt(0).toUpperCase() || <User size={18} />}
              </button>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute right-2 top-full mt-2 w-72 rounded-xl bg-white text-slate-800 shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in duration-150">
                  {/* Thông tin người dùng */}
                  <div className="border-b border-stone-100 px-4 py-3 bg-stone-50">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-1.5">
                      <span className="inline-block rounded bg-[#A50C1E]/10 border border-[#A50C1E]/20 px-2 py-0.5 text-[10px] font-bold text-[#A50C1E] uppercase">
                        Role: {user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Tính năng nâng cao CHỈ HIỂN THỊ DÀNH CHO ROLE QUẢN LÝ / CHUYÊN GIA / ADMIN */}
                  {isManagementRole && (
                    <div className="max-h-[60vh] overflow-y-auto divide-y divide-stone-100 text-sm">
                      <div className="py-2">
                        <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Hệ thống & Thẩm định
                        </div>
                        <NavLink
                          to="/dashboard"
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-50 font-bold text-[#A50C1E]' : 'text-slate-700'
                            }`
                          }
                        >
                          <LayoutDashboard size={16} />
                          <span className="hover:underline">Dashboard</span>
                        </NavLink>

                        <NavLink
                          to="/verification"
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-50 font-bold text-[#A50C1E]' : 'text-slate-700'
                            }`
                          }
                        >
                          <CheckCircle2 size={16} />
                          <span className="hover:underline">Kiểm duyệt</span>
                        </NavLink>

                        <NavLink
                          to="/blockchain"
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-50 font-bold text-[#A50C1E]' : 'text-slate-700'
                            }`
                          }
                        >
                          <Blocks size={16} />
                          <span className="hover:underline">Sổ cái Blockchain</span>
                        </NavLink>
                      </div>

                      {isSystemAdmin && (
                        <div className="py-2 bg-red-50/40">
                          <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A50C1E] flex items-center gap-1">
                            <FolderCog size={12} /> Quản trị Admin
                          </div>

                          <NavLink
                            to="/master-data/users"
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-100/60 font-bold text-[#A50C1E]' : 'text-slate-700'
                              }`
                            }
                          >
                            <Users size={16} />
                            <span className="hover:underline">Người dùng & Chuyên gia</span>
                          </NavLink>

                          <NavLink
                            to="/master-data/heritage-fields"
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-100/60 font-bold text-[#A50C1E]' : 'text-slate-700'
                              }`
                            }
                          >
                            <Layers size={16} />
                            <span className="hover:underline">Loại hình di sản</span>
                          </NavLink>

                          <NavLink
                            to="/master-data/specializations"
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-100/60 font-bold text-[#A50C1E]' : 'text-slate-700'
                              }`
                            }
                          >
                            <Award size={16} />
                            <span className="hover:underline">Lĩnh vực chuyên môn</span>
                          </NavLink>
                        </div>
                      )}

                      <div className="py-2">
                        <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Tổ chức & Đơn vị
                        </div>

                        <NavLink
                          to="/organization/list"
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-50 font-bold text-[#A50C1E]' : 'text-slate-700'
                            }`
                          }
                        >
                          <Building2 size={16} />
                          <span className="hover:underline">Danh sách tổ chức</span>
                        </NavLink>

                        {isSystemAdmin && (
                          <NavLink
                            to="/organization/pending"
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-50 font-bold text-[#A50C1E]' : 'text-slate-700'
                              }`
                            }
                          >
                            <CheckSquare size={16} />
                            <span className="hover:underline">Duyệt yêu cầu tổ chức</span>
                          </NavLink>
                        )}

                        <NavLink
                          to="/organization/request"
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-stone-100 hover:text-[#A50C1E] ${isActive ? 'bg-red-50 font-bold text-[#A50C1E]' : 'text-slate-700'
                            }`
                          }
                        >
                          <FilePlus size={16} />
                          <span className="hover:underline">Đăng ký tổ chức mới</span>
                        </NavLink>
                      </div>
                    </div>
                  )}

                  {/* NÚT ĐĂNG XUẤT TÀI KHOẢN */}
                  <div className="p-2 border-t border-stone-100 bg-stone-50">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>{isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất tài khoản'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
}
