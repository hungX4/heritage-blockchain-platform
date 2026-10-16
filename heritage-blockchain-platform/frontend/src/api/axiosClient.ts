import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3636/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-device-id': 'browser-default-device'
  }
});

// 1. Request Interceptor: Gắn Access Token từ Zustand RAM
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Biến lưu Promise Refresh đang chạy để chống gọi trùng lặp
let refreshTokenPromise: Promise<string> | null = null;

// Hàm Refresh Token dùng chung duy nhất
export const doRefreshToken = async (): Promise<string> => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = axios.post(
    `${axiosClient.defaults.baseURL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': 'browser-default-device'
      }
    }
  ).then(res => {
    // Bóc tách linh hoạt: hỗ trợ cả res.data.data lẫn res.data
    const responseData = res.data?.data || res.data;
    const accessToken = responseData?.accessToken;
    const userData = responseData?.userData || responseData?.user;

    if (!accessToken) {
      throw new Error('Không nhận được Access Token hợp lệ từ Server');
    }

    useAuthStore.getState().setAuth(userData, accessToken);
    return accessToken;
  }).catch(refreshError => {
    console.error("Refresh token failed:", refreshError);
    useAuthStore.getState().clearAuth();

    const publicPaths = ['/', '/login', '/register'];
    if (!publicPaths.includes(window.location.pathname)) {
      window.location.href = '/login';
    }
    return Promise.reject(refreshError);
  }).finally(() => {
    refreshTokenPromise = null;
  });

  return refreshTokenPromise;
};

// 2. Response Interceptor: Bắt lỗi 401 và retry
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Dùng chung hàm doRefreshToken()
        const newAccessToken = await doRefreshToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// 3. Xử lý sự kiện Back-Forward Cache (bfcache)
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      const token = useAuthStore.getState().accessToken;
      if (!token) {
        // Gọi doRefreshToken() để dùng chung Promise nếu Interceptor cũng vừa kích hoạt
        doRefreshToken().catch(() => { });
      }
    }
  });
}

export default axiosClient;
