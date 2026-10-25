import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export function AppLayout() {

  return (
    <div className="min-h-screen w-full bg-[#0b1320] text-slate-100 overflow-x-hidden">
      {/* Navbar nổi cố định trên cùng */}
      <Navbar />


      {/* Main chứa Hero và các trang nội dung - Tràn 100% không vướng Padding */}
      <main className="w-full p-0 m-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
