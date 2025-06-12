import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '@/services/auth';

export function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const tokenFromUrl = searchParams.get('token');

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerification(tokenFromUrl);
    } else {
      setStatus('manual');
    }
  }, [tokenFromUrl]);

  const handleVerification = async (verificationToken: string) => {
    try {
      setStatus('loading');
      const response = await verifyEmail(verificationToken);
      setStatus('success');
      setMessage(response.message || 'Email verificado com sucesso!');
      
      // Redireciona para login após 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Token inválido ou expirado');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('Por favor, insira seu email');
      return;
    }

    setIsResending(true);
    try {
      const response = await resendVerificationEmail(email);
      setMessage(response.message || 'Email de verificação reenviado');
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Erro ao reenviar email');
    } finally {
      setIsResending(false);
    }
  };

  const handleManualVerification = async () => {
    if (!token) {
      setMessage('Por favor, insira o token de verificação');
      return;
    }

    setIsVerifying(true);
    try {
      await handleVerification(token);
    } catch (error) {
      // Erro já tratado na função handleVerification
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Mail className="w-6 h-6" />
            Verificação de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-300">Verificando seu email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Email Verificado!</h3>
              <p className="text-slate-300 mb-4">{message}</p>
              <p className="text-sm text-slate-400">Redirecionando para o login...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Verificação Falhou</h3>
              <p className="text-red-400 mb-4">{message}</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resend-email" className="text-slate-300">
                    Reenviar email de verificação
                  </Label>
                  <Input
                    id="resend-email"
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Reenviar Email'
                  )}
                </Button>
              </div>
            </div>
          )}

          {status === 'manual' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                Verificar Email Manualmente
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-token" className="text-slate-300">
                    Token de Verificação
                  </Label>
                  <Input
                    id="verification-token"
                    type="text"
                    placeholder="Cole o token aqui"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-400">
                    Cole o token que você recebeu por email
                  </p>
                </div>
                <Button
                  onClick={handleManualVerification}
                  disabled={isVerifying}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar Token'
                  )}
                </Button>

                <div className="border-t border-slate-600 pt-4">
                  <p className="text-sm text-slate-400 mb-3 text-center">
                    Não recebeu o email?
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button
                      onClick={handleResendEmail}
                      disabled={isResending}
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Reenviar Email de Verificação'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && (status === 'manual' || status === 'error') && (
            <div className={`text-sm text-center ${
              message.includes('sucesso') || message.includes('enviado') 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {message}
            </div>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white"
            >
              Voltar para o Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}