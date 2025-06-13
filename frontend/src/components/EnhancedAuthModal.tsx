import { useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { X, Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle, Loader2, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { register, type RegisterData } from '@/services/auth';

interface EnhancedAuthModalProps {
  children?: ReactNode;
  defaultTab?: 'login' | 'register';
}

export function EnhancedAuthModal({ children, defaultTab = 'login' }: EnhancedAuthModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const { login, error: loginError, loading: loginLoading } = useAuth();
  
  // Register state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleOpen = () => {
    setOpen(true);
    setMode(defaultTab);
  };

  const handleClose = () => {
    setOpen(false);
    setMode(defaultTab);
    
    // Reset all states
    setLoginData({ email: '', password: '' });
    setRegisterData({
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: ''
    });
    setRegisterError(null);
    setRegisterLoading(false);
    setRegisterSuccess(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordStrength(0);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username: loginData.email, password: loginData.password });
      handleClose();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    // Validation
    if (!registerData.email || !registerData.password || !registerData.confirmPassword) {
      setRegisterError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('As senhas não coincidem');
      return;
    }

    if (passwordStrength < 3) {
      setRegisterError('A senha deve ser mais forte. Use pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setRegisterError('Por favor, insira um email válido');
      return;
    }

    setRegisterLoading(true);

    try {
      const userData: RegisterData = {
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.first_name || undefined,
        last_name: registerData.last_name || undefined,
        is_active: true,
        is_verified: false,
        is_superuser: false
      };

      const response = await register(userData);
      if (response.success) {
        setRegisterSuccess(true);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.data?.detail) {
        setRegisterError(err.response.data.detail);
      } else {
        setRegisterError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setRegisterData(prev => ({ ...prev, password: value }));
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444';
    if (passwordStrength <= 2) return '#f59e0b';
    if (passwordStrength <= 3) return '#eab308';
    if (passwordStrength <= 4) return '#22c55e';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Muito fraca';
    if (passwordStrength <= 2) return 'Fraca';
    if (passwordStrength <= 3) return 'Média';
    if (passwordStrength <= 4) return 'Forte';
    return 'Muito forte';
  };

  const renderSuccessScreen = () => (
    <div className="text-center p-8">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-yellow-800" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4">
        Conta criada com sucesso! 🎉
      </h3>
      
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
        <p className="text-green-400 text-sm leading-relaxed">
          Um email de verificação foi enviado para <strong>{registerData.email}</strong>. 
          Verifique sua caixa de entrada e clique no link para ativar sua conta.
        </p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => setMode('login')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          Fazer Login
        </button>
        <button
          onClick={handleClose}
          className="w-full text-slate-400 hover:text-white py-2 px-4 rounded-xl transition-colors duration-200"
        >
          Fechar
        </button>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Criar Nova Conta</h2>
        <p className="text-slate-400">Junte-se ao BetMapEAS e comece a controlar suas apostas</p>
      </div>

      <form onSubmit={handleRegisterSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nome</label>
            <div className="relative">
              <input
                type="text"
                value={registerData.first_name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="João"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Sobrenome</label>
            <div className="relative">
              <input
                type="text"
                value={registerData.last_name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="Silva"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Senha *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={registerData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {registerData.password && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Força da senha:</span>
                <span style={{ color: getPasswordStrengthColor() }} className="font-medium">
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: getPasswordStrengthColor()
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Confirmar Senha *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {registerError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{registerError}</p>
          </div>
        )}

        <button 
          type="submit"
          disabled={registerLoading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {registerLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Criando conta...</span>
            </>
          ) : (
            <span>Criar Conta</span>
          )}
        </button>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
          >
            Já tem conta? Faça login
          </button>
        </div>
      </form>
    </div>
  );

  const renderLoginForm = () => (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta!</h2>
        <p className="text-slate-400">Entre na sua conta para continuar</p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {loginError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{loginError}</p>
          </div>
        )}

        <button 
          type="submit"
          disabled={loginLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loginLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Entrando...</span>
            </>
          ) : (
            <span>Entrar</span>
          )}
        </button>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setMode('register')}
            className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors duration-200"
          >
            Não tem conta? Criar conta
          </button>
        </div>
      </form>
    </div>
  );

  if (!open) {
    return (
      <div onClick={handleOpen} style={{ display: 'contents', cursor: 'pointer' }}>
        {children}
      </div>
    );
  }

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-t-2xl" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-slate-800/50 hover:bg-slate-700/50 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 z-10"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Content */}
        {registerSuccess ? renderSuccessScreen() : mode === 'register' ? renderRegisterForm() : renderLoginForm()}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}