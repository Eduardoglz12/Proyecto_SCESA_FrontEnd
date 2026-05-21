import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ArrowLeft, RefreshCw, FileText, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { api } from '../services/api';
import { Alumno, AsistenciaBackend, Registro } from '../../types';
import { generarPDFAsistencia } from '../utils/pdfGenerator';

export function Reportes() {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaBackend[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el rango de fechas (Por defecto: Hoy)
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(hoyStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);

  const COLORS = ['#22C55E', '#EF4444'];

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resAlumnos, resAsistencias] = await Promise.all([
        api.get<Alumno[]>('/api/alumnos'),
        api.get<AsistenciaBackend[]>('/api/asistencia')
      ]);
      setAlumnos(resAlumnos);
      setAsistencias(resAsistencias);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar datos para reportes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const exportarPDF = () => {
    if (asistencias.length === 0) return toast.error("No hay datos para exportar");

    try {
      // Transformar para el generador de PDF
      const registros: Registro[] = asistencias.map(item => {
        const fechaObj = new Date(item.fecha);
        return {
          id: item.id.toString(),
          alumno: item.numeroControl,
          nombre: item.nombre,
          grupo: item.grupo,
          turno: item.turno,
          tipo: item.evento?.toUpperCase() === 'ENTRADA' ? 'Entrada' : 'Salida',
          hora: fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          fecha: fechaObj.toLocaleDateString('es-MX')
        };
      });

      generarPDFAsistencia(registros, {
        grupo: 'TODOS',
        turno: 'AMBOS',
        tipo: 'TODOS'
      });
      toast.success("Reporte estadístico generado");
    } catch (error) {
      toast.error("Error al generar PDF");
    }
  };

  // Filtrar asistencias según el rango seleccionado
  const asistenciasFiltradas = useMemo(() => {
    return asistencias.filter(a => {
      const fechaA = a.fecha.split('T')[0];
      return fechaA >= fechaInicio && fechaA <= fechaFin;
    });
  }, [asistencias, fechaInicio, fechaFin]);

  const exportarPDF = () => {
    if (asistenciasFiltradas.length === 0) return toast.error("No hay datos en este rango para exportar");

    try {
      const registros: Registro[] = asistenciasFiltradas.map(item => {
        const fechaObj = new Date(item.fecha);
        return {
          id: item.id.toString(),
          alumno: item.numeroControl,
          nombre: item.nombre,
          grupo: item.grupo,
          turno: item.turno,
          tipo: item.evento?.toUpperCase() === 'ENTRADA' ? 'Entrada' : 'Salida',
          hora: fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          fecha: fechaObj.toLocaleDateString('es-MX')
        };
      });

      generarPDFAsistencia(registros, {
        grupo: 'RANGO SELECCIONADO',
        turno: `${fechaInicio} al ${fechaFin}`,
        tipo: 'REPORTE'
      });
      toast.success("Reporte generado correctamente");
    } catch (error) {
      toast.error("Error al generar PDF");
    }
  };

  const reportData = useMemo(() => {
    if (alumnos.length === 0) return { diaria: [], puntualidad: [], porGrupo: [] };

    // 1. Asistencia Diaria (Días dentro del rango)
    // Si el rango es de un solo día, mostramos solo ese día.
    // Si es mayor, mostramos los días intermedios.
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const dias = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dias.push(new Date(d).toISOString().split('T')[0]);
    }

    // Limitamos a los últimos 10 días si el rango es muy grande para que la gráfica no se rompa
    const diasAMostrar = dias.slice(-10);

    const diaria = diasAMostrar.map(fecha => {
      const presentesSet = new Set(
        asistencias
          .filter(a => a.fecha.startsWith(fecha) && a.evento?.toUpperCase() === 'ENTRADA')
          .map(a => a.numeroControl)
      );
      return {
        dia: fecha.split('-').slice(1).reverse().join('/'),
        presentes: presentesSet.size,
        ausentes: alumnos.length - presentesSet.size
      };
    });

    // 2. Puntualidad (Basado en el filtro actual)
    const aTiempo = asistenciasFiltradas.filter(a => {
      if (a.evento?.toUpperCase() !== 'ENTRADA') return false;
      const fechaObj = new Date(a.fecha);
      const hora = fechaObj.getHours();
      const min = fechaObj.getMinutes();
      const tiempo = hora * 60 + min;
      return tiempo <= 435 || (tiempo >= 780 && tiempo <= 795); // 7:15 o 13:15
    }).length;

    const totalEntradas = asistenciasFiltradas.filter(a => a.evento?.toUpperCase() === 'ENTRADA').length;
    const puntualidad = [
      { nombre: 'A tiempo', valor: aTiempo },
      { nombre: 'Retardos', valor: Math.max(0, totalEntradas - aTiempo) }
    ];

    // 3. Estadísticas por Grado/Grupo (Basado en el último día del rango o el rango completo)
    const gruposUnicos = Array.from(new Set(alumnos.map(al => `${al.grado}°${al.grupo}`)));
    const porGrupo = gruposUnicos.map(id => {
      const alumnosEnGrupo = alumnos.filter(al => `${al.grado}°${al.grupo}` === id);

      // Asistencia promedio en el rango para este grupo
      const asistenciasGrupo = asistenciasFiltradas.filter(a =>
        a.evento?.toUpperCase() === 'ENTRADA' &&
        alumnosEnGrupo.some(al => al.numeroControl === a.numeroControl)
      );

      // Calculamos un promedio aproximado: (total asistencias / (alumnos * dias en rango))
      const diasEnRango = dias.length || 1;
      const promedio = Math.round((asistenciasGrupo.length / (alumnosEnGrupo.length * diasEnRango)) * 100) || 0;

      return {
        grupo: id,
        promedio: Math.min(100, promedio),
      };
    });

    return { diaria, puntualidad, porGrupo };
  }, [alumnos, asistencias, asistenciasFiltradas, fechaInicio, fechaFin]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header title="Reportes y Estadísticas" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Controles de Rango */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha Inicio</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha Fin</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportarPDF} variant="outline" className="gap-2 border-red-600 text-red-600 hover:bg-red-50">
              <FileText className="w-4 h-4" /> Exportar PDF
            </Button>
            <Button onClick={cargarDatos} disabled={cargando} variant="outline">
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-[#2E6DA4]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Panel Principal
          </Button>
        </div>

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
