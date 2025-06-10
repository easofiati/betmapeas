
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Shield, TrendingUp, Users, Eye, Clock, Calendar, ArrowRight, UserPlus, Target, BarChart, Trophy, Heart, Lightbulb, PieChart, Settings, Database } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Shield,
      title: "Privacidade Total",
      description: "Seus dados ficam 100% privados e seguros. Nenhuma informação é compartilhada com terceiros.",
      bgColor: "bg-blue-100",
      iconBg: "bg-blue-500"
    },
    {
      icon: BarChart3,
      title: "Dashboard Avançado",
      description: "Visualize estatísticas detalhadas, gráficos de performance e insights personalizados.",
      bgColor: "bg-green-100",
      iconBg: "bg-green-500"
    },
    {
      icon: Target,
      title: "Registro Completo",
      description: "Registre apostas com todos os detalhes: valor, odds, modalidade, resultado e muito mais.",
      bgColor: "bg-purple-100",
      iconBg: "bg-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Análise de ROI",
      description: "Acompanhe seu retorno sobre investimento em tempo real com métricas precisas.",
      bgColor: "bg-orange-100",
      iconBg: "bg-orange-500"
    },
    {
      icon: Eye,
      title: "Interface Intuitiva",
      description: "Design limpo e moderno, fácil de usar tanto no desktop quanto no mobile.",
      bgColor: "bg-red-100",
      iconBg: "bg-red-500"
    },
    {
      icon: Clock,
      title: "Histórico Detalhado",
      description: "Mantenha histórico completo de todas suas apostas com filtros avançados.",
      bgColor: "bg-indigo-100",
      iconBg: "bg-indigo-500"
    }
  ];

  const howItWorksSteps = [
    {
      number: "1",
      title: "Crie sua Conta",
      description: "Cadastro rápido e seguro. Seus dados ficam protegidos e apenas você tem acesso.",
      color: "bg-blue-500",
      icon: UserPlus
    },
    {
      number: "2", 
      title: "Registre Apostas",
      description: "Adicione suas apostas com todos os detalhes: valor, odds, modalidade e muito mais.",
      color: "bg-green-500",
      icon: Database
    },
    {
      number: "3",
      title: "Analise Performance", 
      description: "Dashboard completo com estatísticas, gráficos e insights para melhorar seus resultados.",
      color: "bg-purple-500",
      icon: PieChart
    }
  ];

  const advantages = [
    {
      icon: Trophy,
      title: "Para Apostadores Profissionais",
      description: "Ferramentas avançadas de análise para otimizar estratégias e maximizar retornos com base em dados históricos precisos.",
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Heart,
      title: "Para Apostadores Amadores", 
      description: "Interface simples e educativa que ajuda a entender padrões de apostas e desenvolver melhores estratégias ao longo do tempo.",
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Settings,
      title: "Controle Total",
      description: "Tenha controle completo sobre suas apostas com histórico detalhado, análises personalizadas e relatórios customizáveis.",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BetMapEAS</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white bg-blue-500/10">
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
            🚀 A nova era do controle de apostas
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Transforme suas apostas em
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent block">
              investimentos inteligentes
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Registre, acompanhe e analise suas apostas esportivas com total privacidade. 
            Tome decisões baseadas em dados e maximize seus resultados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg group">
              Começar Gratuitamente
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Como Funciona
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Começar é simples. Em poucos minutos você já estará controlando suas apostas como um profissional
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Linha conectora - visível apenas em desktop */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500"></div>
              
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  {/* Círculo numerado com ícone */}
                  <div className="relative mb-8">
                    <div className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center text-white shadow-lg relative z-10`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-900 font-bold text-sm shadow-md">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="max-w-sm">
                    <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Recursos que fazem a diferença
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Desenvolvido especificamente para apostadores que levam seus resultados a sério
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl ${feature.iconBg}`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                      <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose BetMapEAS Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Por que Escolher o BetMapEAS?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Vantagens exclusivas para apostadores inteligentes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {advantages.map((advantage, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-start space-x-4 p-6 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className={`p-3 rounded-lg ${advantage.bgColor}`}>
                    <advantage.icon className={`w-6 h-6 ${advantage.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">{advantage.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{advantage.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <BarChart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Estatísticas de Performance</h3>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                  Acompanhe métricas detalhadas do seu desempenho e veja como outros usuários estão melhorando seus resultados
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-1">+18%</div>
                  <div className="text-slate-300 text-sm">ROI Médio dos Usuários</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400 mb-1">96%</div>
                  <div className="text-slate-300 text-sm">Satisfação dos Usuários</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BetMapEAS</span>
            </div>
            <div className="flex space-x-6 text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; 2024 BetMapEAS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
