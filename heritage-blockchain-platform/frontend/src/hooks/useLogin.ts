import { useState } from 'react';
import { authApi } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (email: string, passwordRaw: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login({ email, passwordRaw });

      // TODO: Lưu accessToken vào global state (Zustand / Redux / Context)
      setAuth(data.userData, data.accessToken);


      navigate('/');
    } catch (err: any) {
      // Bắt lỗi từ backend (ví dụ: INVALID_CREDENTIALS)
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}
