import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, RefreshCw } from 'lucide-react';
import { forgotPassword } from '@/services/auth';

interface ForgotPasswordDialogProps {
  children?: ReactNode;
}

export function ForgotPasswordDialog({ children }: ForgotPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.detail || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
    setError(null);
    setEmail('');
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300 p-0">
            Esqueci minha senha
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {success ? 'Email Enviado' : 'Recuperar Senha'}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <div className="text-green-400 text-sm">
              Se o email {email} estiver cadastrado, você receberá um link para redefinir sua senha.
              Verifique sua caixa de entrada e spam.
            </div>
            <div className="text-slate-300 text-sm">
              O link expira em 1 hora por questões de segurança.
            </div>
            <Button 
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-slate-300">
                Email da sua conta
              </Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="seu@email.com"
                required
              />
              <p className="text-xs text-slate-400">
                Enviaremos um link para redefinir sua senha
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}