import { useState } from 'react';
import { authApi } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async (email: string, passwordRaw: string, fullName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register({ email, passwordRaw, fullName });

      setAuth(data.userData, data.accessToken);

      // Đăng ký xong backend đã trả token, nên có thể cho vào luôn dashboard
      navigate('/');
    } catch (err: any) {
      // Bắt lỗi từ backend (ví dụ: EMAIL_IS_ALREADY_IN_USE)
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
}
