import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ArrowLeft, Calendar, Download, TrendingUp, TrendingDown, Users, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

interface Alumno {
  numeroControl: string;
  grado: number;
  grupo: string;
  turno: string;
}

interface RegistroAsistencia {
  numeroControl: string;
  evento: string;
  fecha: string;
}

export function Reportes() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('semana');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>([]);
  const [cargando, setCargando] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const COLORS = ['#22C55E', '#EF4444'];

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resAlumnos, resAsistencias] = await Promise.all([
        fetch(`${API_URL}/api/alumnos`),
        fetch(`${API_URL}/api/asistencia`)
      ]);
      setAlumnos(await resAlumnos.json());
      setAsistencias(await resAsistencias.json());
    } catch (error) {
      toast.error("Error al cargar datos para reportes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // LÓGICA DE PROCESAMIENTO DE DATOS
  const reportData = useMemo(() => {
    if (alumnos.length === 0) return { diaria: [], puntualidad: [], porGrupo: [] };

    // 1. Asistencia Diaria (Últimos 5 días hábiles)
    const ultimosDias = [...Array(5)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const diaria = ultimosDias.map(fecha => {
      const presentesSet = new Set(
        asistencias
          .filter(a => a.fecha.startsWith(fecha) && a.evento === 'ENTRADA')
          .map(a => a.numeroControl)
      );
      return {
        dia: fecha.split('-').slice(1).reverse().join('/'),
        presentes: presentesSet.size,
        ausentes: alumnos.length - presentesSet.size
      };
    });

    // 2. Puntualidad (Simulada: Entradas antes de las 07:15 o 13:15)
    const aTiempo = asistencias.filter(a => {
      if (a.evento !== 'ENTRADA') return false;
      const hora = new Date(a.fecha).getHours();
      const min = new Date(a.fecha).getMinutes();
      const tiempo = hora * 60 + min;
      return tiempo <= 435 || (tiempo >= 780 && tiempo <= 795); // 7:15 o 13:15
    }).length;

    const puntualidad = [
      { nombre: 'A tiempo', valor: aTiempo },
      { nombre: 'Retardos', valor: Math.max(0, asistencias.filter(a => a.evento === 'ENTRADA').length - aTiempo) }
    ];

    // 3. Estadísticas por Grado/Grupo
    const gruposUnicos = Array.from(new Set(alumnos.map(al => `${al.grado}°${al.grupo}`)));
    const porGrupo = gruposUnicos.map(id => {
      const alumnosEnGrupo = alumnos.filter(al => `${al.grado}°${al.grupo}` === id);
      const hoy = new Date().toISOString().split('T')[0];
      const presentes = asistencias.filter(a =>
        a.fecha.startsWith(hoy) &&
        alumnosEnGrupo.some(al => al.numeroControl === a.numeroControl)
      ).length;

      return {
        grupo: id,
        promedio: Math.round((presentes / alumnosEnGrupo.length) * 100) || 0,
        tendencia: Math.random() > 0.5 ? 'up' : 'down' // Simulado por ahora
      };
    });

    return { diaria, puntualidad, porGrupo };
  }, [alumnos, asistencias]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header title="Reportes y Estadísticas" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-[#2E6DA4]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Panel Principal
          </Button>
          <Button onClick={cargarDatos} disabled={cargando} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${cargando ? 'animate-spin' : ''}`} /> Sincronizar
          </Button>
        </div>

        {/* Gráficos Reales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6">Asistencia Diaria (Real)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.diaria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="presentes" fill="#22C55E" name="Presentes" />
                <Bar dataKey="ausentes" fill="#EF4444" name="Ausentes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-6">Distribución de Puntualidad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.puntualidad}
                  dataKey="valor"
                  cx="50%" cy="50%" outerRadius={80}
                  label={({ nombre, value }) => `${nombre}: ${value}`}
                >
                  {reportData.puntualidad.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla Dinámica por Grupo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-6">Estado Actual por Grupo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F5F7FA]">
                  <th className="text-left p-4">Grupo</th>
                  <th className="text-left p-4">Asistencia Hoy</th>
                  <th className="text-left p-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reportData.porGrupo.map((stat) => (
                  <tr key={stat.grupo} className="border-b">
                    <td className="p-4 font-bold">{stat.grupo}</td>
                    <td className="p-4 text-2xl">{stat.promedio}%</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded text-sm ${
                        stat.promedio >= 90 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {stat.promedio >= 90 ? 'Excelente' : 'Atención'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}