import axios from 'axios';

const API_URL = 'http://localhost/api'; // Roteado pelo Nginx para o backend

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const login = async ({ username, password }: LoginCredentials): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Save tokens to localStorage
    if (response.data.access_token) {
      localStorage.setItem('accessToken', response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/refresh`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${refresh}`,
        },
      }
    );

    // Update tokens in localStorage
    if (response.data.access_token) {
      localStorage.setItem('accessToken', response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }

    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Remove invalid tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Add axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await refreshToken();
        const newToken = getToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const register = async (userData: RegisterData): Promise<ApiResponse> => {
  try {
    const response = await axios.post<ApiResponse>(
      `${API_URL}/auth/register`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/verify-email`,
      null,
      {
        params: { token }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/resend-verification`,
      null,
      {
        params: { email }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Resend verification error:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/forgot-password`,
      null,
      {
        params: { email }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/reset-password`,
      null,
      {
        params: { token, new_password: newPassword }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<any> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token available');
    }

    const response = await axios.get(
      `${API_URL}/auth/me`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};
