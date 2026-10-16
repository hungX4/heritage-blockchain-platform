import { Archive, Blocks, CheckCircle2, LayoutDashboard, ScrollText, LogOut, Power, PowerCircle, Goal, ChevronDown, ChevronRight, CheckSquare, FilePlus, Building2, Layers, Award, FolderCog, Users } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { authApi } from '../../api/auth.api';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/verification', label: 'Kiểm duyệt', icon: CheckCircle2 },
  { to: '/blockchain', label: 'Blockchain', icon: Blocks },
];

export function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHeritageMenuOpen, setIsHeritageMenuOpen] = useState(
    location.pathname.startsWith('/heritage') || location.pathname.startsWith('/heritages')
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(location.pathname.startsWith('/organization'));
  const [isMgmtMenuOpen, setIsMgmtMenuOpen] = useState(location.pathname.startsWith('/master-data'));
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout(); // Gọi API để backend clear HttpOnly Cookie
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      clearAuth(); // Xóa state trên Zustand (RAM)
      navigate('/login');
    }
  };

  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN';

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-stone-200 bg-white px-5 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded bg-emerald-700 text-white">
          <ScrollText size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold">Heritage Blockchain</p>
          <p className="text-xs text-slate-500">Research Prototype</p>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="mt-8 flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-stone-100'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}

        {/* --- MENU CHA: DI SẢN --- */}
        <div>
          <button
            onClick={() => setIsHeritageMenuOpen(!isHeritageMenuOpen)}
            className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium transition-colors ${location.pathname.startsWith('/heritage') || location.pathname.startsWith('/heritages')
              ? 'bg-stone-100 text-slate-900'
              : 'text-slate-600 hover:bg-stone-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <Archive size={18} />
              <span>Di sản</span>
            </div>
            {isHeritageMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* SUB MENU DI SẢN */}
          {isHeritageMenuOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-stone-200 pl-3">
              <NavLink
                to="/heritage/list"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-stone-100'
                  }`
                }
              >
                <ScrollText size={14} /> Danh sách di sản
              </NavLink>

              <NavLink
                to="/heritage/create"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-stone-100'
                  }`
                }
              >
                <FilePlus size={14} /> Lập hồ sơ di sản
              </NavLink>
            </div>
          )}
        </div>

        {/* --- MENU CHA: QUẢN LÝ (CHỈ SYSTEM_ADMIN THẤY) --- */}
        {isSystemAdmin && (
          <div>
            <button
              onClick={() => setIsMgmtMenuOpen(!isMgmtMenuOpen)}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium transition-colors ${location.pathname.startsWith('/master-data')
                ? 'bg-stone-100 text-slate-900'
                : 'text-slate-600 hover:bg-stone-100'
                }`}
            >
              <div className="flex items-center gap-3">
                <FolderCog size={18} />
                <span>Quản lý</span>
              </div>
              {isMgmtMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isMgmtMenuOpen && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-stone-200 pl-3">

                <NavLink
                  to="/master-data/users"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium ${isActive ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-slate-600 hover:bg-stone-100'
                    }`
                  }
                >
                  <Users size={14} /> Người dùng & Chuyên gia
                </NavLink>
                <NavLink
                  to="/master-data/heritage-fields"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium ${isActive ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-slate-600 hover:bg-stone-100'
                    }`
                  }
                >
                  <Layers size={14} /> Loại hình di sản
                </NavLink>

                <NavLink
                  to="/master-data/specializations"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium ${isActive ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-slate-600 hover:bg-stone-100'
                    }`
                  }
                >
                  <Award size={14} /> Chuyên môn
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* --- MENU CHA: TỔ CHỨC --- */}
        <div>
          <button
            onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
            className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium transition-colors ${location.pathname.startsWith('/organization')
              ? 'bg-stone-100 text-slate-900'
              : 'text-slate-600 hover:bg-stone-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <Goal size={18} />
              <span>Tổ chức</span>
            </div>
            {isOrgMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* --- SUB MENU CON --- */}
          {isOrgMenuOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-stone-200 pl-3">

              <NavLink
                to="/organization/list"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-stone-100'
                  }`
                }
              >
                <Building2 size={14} /> Danh sách tổ chức
              </NavLink>
              {/* Mục con 1: Chỉ System Admin mới nhìn thấy */}
              {isSystemAdmin && (
                <NavLink
                  to="/organization/pending"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-stone-100'
                    }`
                  }
                >
                  <CheckSquare size={14} /> Duyệt yêu cầu
                </NavLink>
              )}

              {/* Mục con 2: Mọi User đều thấy */}
              <NavLink
                to="/organization/request"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-stone-100'
                  }`
                }
              >
                <FilePlus size={14} /> Đăng ký tổ chức
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* User Info & Logout (Nằm dưới cùng) */}
      {/* User Info & Logout - ĐÃ ĐƯỢC LÀM LẠI CÂN ĐỐI */}
      <div className="mt-auto border-t border-stone-200 pt-4">
        {/* Khối thông tin User */}
        <div className="mb-4 flex items-center gap-3 px-1">
          {/* Avatar giả lập từ chữ cái đầu tiên */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>

        {/* Nút Đăng xuất full-width */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
        >
          <LogOut size={18} />
          {isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}
        </button>
      </div>
    </aside>
  );
}
