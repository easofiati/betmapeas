import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-red-400 border-red-500 hover:bg-red-500 hover:text-white"
          >
            Sair
          </Button>
        </div>
      </nav>
      
      <main className="container mx-auto p-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Bem-vindo ao Painel de Controle</h2>
          <p className="text-slate-300">
            Você está autenticado com sucesso! Esta é uma área protegida da aplicação.
          </p>
        </div>
      </main>
    </div>
  );
}
