import { useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Eye, EyeOff, Mail, Lock, RefreshCw, CheckCircle } from 'lucide-react';
import { register, forgotPassword, type RegisterData } from '@/services/auth';

interface SimpleModalProps {
  children?: ReactNode;
  defaultTab?: 'login' | 'register' | 'forgot';
}

export function SimpleModal({ children, defaultTab = 'login' }: SimpleModalProps) {
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
    console.log('SimpleModal: Opening modal...');
    setOpen(true);
    setMode(defaultTab);
  };

  const handleClose = () => {
    console.log('SimpleModal: Closing modal...');
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
    console.log('SimpleModal: Login submitted:', loginData);
    try {
      await login({ username: loginData.email, password: loginData.password });
      handleClose();
    } catch (err) {
      console.error('SimpleModal: Login error:', err);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SimpleModal: Register submitted:', registerData);
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
      console.error('SimpleModal: Registration error:', err);
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
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <CheckCircle style={{ width: '64px', height: '64px', color: '#10b981', margin: '0 auto 16px' }} />
          <div style={{ 
            color: '#10b981', 
            fontSize: '14px', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.2)', 
            borderRadius: '8px', 
            padding: '16px',
            marginBottom: '16px'
          }}>
            Sua conta foi criada com sucesso! Um email de verificação foi enviado para {registerData.email}.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setMode('login')}
              style={{
                width: '100%',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Fazer Login
            </button>
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      );
    }

    if (mode === 'register') {
      return (
        <form onSubmit={handleRegisterSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Nome</label>
              <input
                type="text"
                value={registerData.first_name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, first_name: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="João"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Sobrenome</label>
              <input
                type="text"
                value={registerData.last_name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, last_name: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '14px'
                }}
                placeholder="Silva"
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Email *</label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '14px'
              }}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Senha *</label>
            <input
              type={showPassword ? "text" : "password"}
              value={registerData.password}
              onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
              style={{
                width: '100%',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '14px'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Confirmar Senha *</label>
            <input
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              style={{
                width: '100%',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '14px'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          {registerError && (
            <div style={{ 
              color: '#f87171', 
              fontSize: '14px', 
              backgroundColor: 'rgba(248, 113, 113, 0.1)', 
              border: '1px solid rgba(248, 113, 113, 0.2)', 
              borderRadius: '8px', 
              padding: '12px',
              marginBottom: '16px'
            }}>
              {registerError}
            </div>
          )}

          <button 
            type="submit"
            disabled={registerLoading}
            style={{
              width: '100%',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px',
              cursor: registerLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: registerLoading ? 0.7 : 1,
              marginBottom: '16px'
            }}
          >
            {registerLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '14px' }}>
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Já tem conta? Faça login
            </button>
          </div>
        </form>
      );
    }

    // Login form (default)
    return (
      <form onSubmit={handleLoginSubmit} style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Email</label>
          <input
            type="email"
            value={loginData.email}
            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
            style={{
              width: '100%',
              backgroundColor: '#334155',
              border: '1px solid #475569',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'white',
              fontSize: '14px'
            }}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Senha</label>
          <input
            type={showPassword ? "text" : "password"}
            value={loginData.password}
            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
            style={{
              width: '100%',
              backgroundColor: '#334155',
              border: '1px solid #475569',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'white',
              fontSize: '14px'
            }}
            placeholder="••••••••"
            required
          />
        </div>

        {loginError && (
          <div style={{ 
            color: '#f87171', 
            fontSize: '14px', 
            backgroundColor: 'rgba(248, 113, 113, 0.1)', 
            border: '1px solid rgba(248, 113, 113, 0.2)', 
            borderRadius: '8px', 
            padding: '12px',
            marginBottom: '16px'
          }}>
            {loginError}
          </div>
        )}

        <button 
          type="submit"
          disabled={loginLoading}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '12px',
            cursor: loginLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: loginLoading ? 0.7 : 1,
            marginBottom: '16px'
          }}
        >
          {loginLoading ? 'Entrando...' : 'Entrar'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#22c55e',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
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

  if (!open) {
    return (
      <div onClick={handleOpen} style={{ display: 'contents', cursor: 'pointer' }}>
        {children}
      </div>
    );
  }

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: '999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div style={{
          background: 'linear-gradient(to right, #2563eb, #7c3aed)',
          height: '8px'
        }}></div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            fontSize: '18px'
          }}
        >
          ×
        </button>
        
        {/* Content */}
        <div style={{ paddingTop: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', padding: '0 20px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: 0
            }}>
              {getTitle()}
            </h2>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}