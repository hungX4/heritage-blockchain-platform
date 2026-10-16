import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { BlockchainRecordsPage } from './pages/BlockchainRecordsPage';
import { DashboardPage } from './pages/DashboardPage';
import { HeritageDetailPage } from './pages/HeritageDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { CreateHeritage } from './pages/CreateHeritagePage';
import { Toaster } from 'react-hot-toast';
import { useAuthInit } from './hooks/useAuthInit';
import CreateOrganizationPage from './pages/OrganizattionPage';
import PendingOrganizationsPage from './pages/PendingOrganization';
import OrganizationListPage from './pages/OrganizationListPage';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { HeritageFieldsPage } from './pages/master-data/HeritageFieldsPage';
import { SpecializationsPage } from './pages/master-data/SpecializationsPage';
import { UserManagementPage } from './pages/master-data/UserManagementPage';
import { HeritagePage } from './pages/HeritagePage';

export default function App() {

  const { isInitializing } = useAuthInit();
  if (isInitializing) {
    return (
      <div className="grid h-screen place-items-center bg-[#f7f7f2]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Đang khởi tạo ứng dụng...</p>
        </div>
      </div>
    );
  }
  return (

    <BrowserRouter>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/heritage/create" element={<CreateHeritage />} />
          <Route path="/heritage/list" element={<HeritagePage />} />
          <Route path="/heritages/:id" element={<HeritageDetailPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/blockchain" element={<BlockchainRecordsPage />} />
          {/* Cụm Route Tổ chức */}
          <Route path="/organization/list" element={<OrganizationListPage />} />
          <Route path="/organization/:id" element={<OrganizationDetailPage />} />
          <Route path="/organization/request" element={<CreateOrganizationPage />} />
          <Route path="/organization/pending" element={<PendingOrganizationsPage />} />
          <Route path="/organization" element={<Navigate to="/organization/list" replace />} />

          {/* --- CỤM ROUTE MASTER DATA (QUẢN LÝ) --- */}
          {/* 3. PROTECTED ROUTES (Chỉ DÀNH RIÊNG cho SYSTEM_ADMIN) */}
          <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
            {/* Module Master Data (Quản lý) */}
            <Route path="/master-data/heritage-fields" element={<HeritageFieldsPage />} />
            <Route path="/master-data/specializations" element={<SpecializationsPage />} />
            <Route path="/master-data/users" element={<UserManagementPage />} />
            {/* Duyệt yêu cầu tổ chức */}
            <Route path="/organization/pending" element={<div>Duyệt tổ chức</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


// export default function App() {
//   const { isInitializing } = useAuthInit();

//   // Hiển thị màn hình Loading trong lúc chờ khôi phục phiên đăng nhập khi F5
//   if (isInitializing) {
//     return (
//       <div className="grid h-screen place-items-center bg-[#f7f7f2]">
//         <div className="flex flex-col items-center gap-3">
//           <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent"></div>
//           <p className="text-sm font-medium text-slate-600">Đang khởi tạo ứng dụng...</p>
//         </div>
//       </div>
//     );
//   }
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Route Công khai */}
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />

//         {/* Route Cần bảo mật (Phải đăng nhập) */}
//         <Route element={<ProtectedRoute />}>
//           <Route element={<AppLayout />}>
//             {/* Ai đăng nhập rồi cũng vào được */}
//             <Route path="/" element={<Navigate to="/dashboard" replace />} />
//             <Route path="/dashboard" element={<DashboardPage />} />
//             <Route path="/heritages" element={<HeritageListPage />} />
//             <Route path="/heritages/:id" element={<HeritageDetailPage />} />

//             {/* Chỉ REVIEWER và ADMIN mới vào được trang Kiểm duyệt */}
//             <Route element={<ProtectedRoute allowedRoles={['REVIEWER', 'ADMIN']} />}>
//               <Route path="/verification" element={<VerificationPage />} />
//             </Route>

//             {/* Chỉ ADMIN mới vào được trang Blockchain cấu hình */}
//             <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
//               <Route path="/blockchain" element={<BlockchainRecordsPage />} />
//             </Route>
//           </Route>
//         </Route>
//       </Routes>
//     </BrowserRouter>


//     </Routes>
//   );
// }
