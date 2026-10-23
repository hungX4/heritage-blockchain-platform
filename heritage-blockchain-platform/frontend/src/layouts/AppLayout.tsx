import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/layout/Navbar';
// 🟢 Nhớ kiểm tra lại đường dẫn file Navbar của bạn

export function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Bảo vệ Route: Nếu chưa đăng nhập thì đá về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbf9]">
      {/* 1. Thanh Navbar trải dài 100% trên cùng */}
      <Navbar />

      {/* 2. Vùng hiển thị nội dung chính (Dashboard, Danh sách di sản...) bên dưới */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
