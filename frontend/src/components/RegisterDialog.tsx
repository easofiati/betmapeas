import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import axios from 'axios';

const API_URL = 'http://localhost/api';

interface RegisterDialogProps {
  children?: ReactNode;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}

export function RegisterDialog({ children }: RegisterDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return 'Todos os campos obrigatórios devem ser preenchidos';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'As senhas não coincidem';
    }

    if (formData.password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres';
    }

    if (!/[A-Z]/.test(formData.password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula';
    }

    if (!/[a-z]/.test(formData.password)) {
      return 'A senha deve conter pelo menos uma letra minúscula';
    }

    if (!/\d/.test(formData.password)) {
      return 'A senha deve conter pelo menos um número';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Email inválido';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        is_active: true,
        is_verified: false,
        is_superuser: false
      });

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          first_name: '',
          last_name: ''
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
    setError(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-green-500/10">
            Criar Conta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {success ? 'Conta criada com sucesso!' : 'Criar nova conta'}
          </DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="space-y-4">
            <div className="text-green-400 text-sm">
              Sua conta foi criada com sucesso! Um email de verificação foi enviado para {formData.email}. 
              Verifique sua caixa de entrada e clique no link para ativar sua conta.
            </div>
            <Button 
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-slate-300">
                  Nome
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange('first_name')}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-slate-300">
                  Sobrenome
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange('last_name')}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Senha *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
              <div className="text-xs text-slate-400">
                Mínimo 8 caracteres, deve conter maiúscula, minúscula e número
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                Confirmar Senha *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}