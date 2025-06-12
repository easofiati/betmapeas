import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { login as authLogin, logout as authLogout, isAuthenticated } from '@/services/auth';
import { LoginCredentials } from '@/services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<boolean>(false);

  // Verifica se o usuário já está autenticado no carregamento inicial
  useEffect(() => {
    const checkAuth = () => {
      setAuthState(isAuthenticated());
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await authLogin(credentials);
      setAuthState(true);
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais e tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: authState, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
