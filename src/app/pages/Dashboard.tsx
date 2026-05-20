import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { Users, UserCheck, AlertTriangle, UserPlus, BarChart3, Shield, RefreshCw, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalAlumnos: number;
  entradasHoy: number;
  presentes: number;
  alertas: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [cargando, setCargando] = useState(true);

  const [stats, setStats] = useState({
    totalPresentes: 0,
    entradasRegistradas: 0,
    alertasActivas: 0,
    totalAlumnos: 0
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await api.get<DashboardStats>('/api/asistencia/stats');

      setStats({
        totalAlumnos: data.totalAlumnos || 0,
        entradasRegistradas: data.entradasHoy || 0,
        totalPresentes: data.presentes || 0,
        alertasActivas: data.alertas || 0
      });

    } catch (error: any) {
      toast.error(error.message || "Error al sincronizar estadísticas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 60000);
    return () => clearInterval(interval);
  }, []);

  const modules = useMemo(() => {
    const baseModules = [
      {
        title: 'Gestión de Alumnos',
        description: 'Alta, modificación y consulta',
        icon: UserPlus,
        path: '/alumnos',
        color: 'bg-[#1A3A5C]'
      },
      {
        title: 'Panel Administrativo',
        description: 'Registros en tiempo real',
        icon: Shield,
        path: '/admin',
        color: 'bg-[#2E6DA4]'
      },
      {
        title: 'Reportes y Estadísticas',
        description: 'Análisis y reportes de asistencia',
        icon: BarChart3,
        path: '/reportes',
        color: 'bg-[#1A3A5C]'
      }
    ];

    if (isAdmin) {
      baseModules.push({
        title: 'Gestión de Usuarios',
        description: 'Administrar accesos y roles',
        icon: Settings,
        path: '/usuarios',
        color: 'bg-slate-700'
      });
    }

    return baseModules;
  }, [isAdmin]);

  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header title="Panel Principal" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#1E1E1E]">Resumen del Día</h2>
              <p className="text-sm text-[#6B7280] capitalize">{fechaHoy}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={cargarDatos}
              disabled={cargando}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Alumnos Presentes"
              value={stats.totalPresentes}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Entradas Registradas"
              value={stats.entradasRegistradas}
              icon={UserCheck}
              color="green"
            />
            <StatCard
              title="Alertas Activas"
              value={stats.alertasActivas}
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              title="Total de Alumnos"
              value={stats.totalAlumnos}
              icon={Users}
              color="gray"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">Módulos del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => (
              <button
                key={module.path}
                onClick={() => navigate(module.path)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${module.color} p-4 rounded-lg group-hover:scale-105 transition-transform`}>
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">
                      {module.title}
                    </h3>
                    <p className="text-sm text-[#6B7280]">
                      {module.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {stats.alertasActivas > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">Alertas Recientes</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#1E1E1E]">Se han detectado {stats.alertasActivas} alertas de asistencia.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
