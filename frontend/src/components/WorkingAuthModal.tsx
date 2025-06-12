import { useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Eye, EyeOff, Mail, Lock, RefreshCw, CheckCircle } from 'lucide-react';
import { register, forgotPassword, type RegisterData } from '@/services/auth';

interface WorkingAuthModalProps {
  children?: ReactNode;
  defaultTab?: 'login' | 'register' | 'forgot';
}

export function WorkingAuthModal({ children, defaultTab = 'login' }: WorkingAuthModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleOpen = () => {
    console.log('Opening modal...');
    setOpen(true);
    setMode(defaultTab);
  };

  const handleClose = () => {
    console.log('Closing modal...');
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
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login submitted:', loginData);
    try {
      await login({ username: loginData.email, password: loginData.password });
      handleClose();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register submitted:', registerData);
    setRegisterError(null);

    // Basic validation
    if (!registerData.email || !registerData.password || !registerData.confirmPassword) {
      setRegisterError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('As senhas não coincidem');
      return;
    }

    if (registerData.password.length < 8) {
      setRegisterError('A senha deve ter pelo menos 8 caracteres');
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

  const renderContent = () => {
    if (mode === 'register' && registerSuccess) {
      return (
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            Sua conta foi criada com sucesso! Um email de verificação foi enviado para {registerData.email}.
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => setMode('login')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Fazer Login
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
            >
              Fechar
            </Button>
          </div>
        </div>
      );
    }

    if (mode === 'register') {
      return (
        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first_name" className="text-slate-300 text-sm">Nome</Label>
              <Input
                id="first_name"
                type="text"
                value={registerData.first_name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, first_name: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white h-9"
                placeholder="João"
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-slate-300 text-sm">Sobrenome</Label>
              <Input
                id="last_name"
                type="text"
                value={registerData.last_name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, last_name: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white h-9"
                placeholder="Silva"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="register-email" className="text-slate-300 text-sm">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="register-email"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white pl-10 h-9"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="register-password" className="text-slate-300 text-sm">Senha *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white pl-10 pr-10 h-9"
                placeholder="••••••••"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 px-3 text-slate-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-xs text-slate-400">
              Mínimo 8 caracteres
            </div>
          </div>

          <div>
            <Label htmlFor="confirm-password" className="text-slate-300 text-sm">Confirmar Senha *</Label>
            <Input
              id="confirm-password"
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white h-9"
              placeholder="••••••••"
              required
            />
          </div>

          {registerError && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {registerError}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={registerLoading}
          >
            {registerLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Já tem conta? Faça login
            </button>
          </div>
        </form>
      );
    }

    // Login form (default)
    return (
      <form onSubmit={handleLoginSubmit} className="space-y-3">
        <div>
          <Label htmlFor="login-email" className="text-slate-300 text-sm">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="login-email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white pl-10 h-9"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="login-password" className="text-slate-300 text-sm">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white pl-10 pr-10 h-9"
              placeholder="••••••••"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 px-3 text-slate-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {loginError && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {loginError}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loginLoading}
        >
          {loginLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>

        <div className="flex justify-between text-sm">
          <button
            type="button"
            onClick={() => setMode('register')}
            className="text-green-400 hover:text-green-300 underline"
          >
            Criar conta
          </button>
        </div>
      </form>
    );
  };

  const getTitle = () => {
    switch (mode) {
      case 'register': return registerSuccess ? 'Conta Criada!' : 'Criar Nova Conta';
      case 'forgot': return 'Recuperar Senha';
      default: return 'Bem-vindo de volta!';
    }
  };

  return (
    <>
      {/* Trigger */}
      <div onClick={handleOpen} style={{ display: 'contents' }}>
        {children}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header stripe */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2"></div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-white z-10 p-1 rounded-full hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Content */}
            <div className="p-6 pt-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {getTitle()}
                </h2>
              </div>

              <div className="space-y-4">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}