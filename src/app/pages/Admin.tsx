import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ArrowLeft, Clock, LogIn, LogOut, Users, RefreshCw, Download, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

// 1. Interfaz que viene del backend en Ktor
interface AsistenciaBackend {
  id: number;
  numeroControl: string;
  nombre: string;
  grupo: string;
  turno: string;
  evento: string;
  fecha: string;
  operador: number;
}

// 2. Interfaz para la interfaz de usuario (UI)
interface Registro {
  id: string;
  alumno: string;
  nombre: string;
  grupo: string;
  turno: string;
  tipo: 'Entrada' | 'Salida';
  hora: string;
  fecha: string; // Formato DD/MM/YYYY para comparaciones
}

export function Admin() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [registros, setRegistros] = useState<Registro[]>([]);

  // Filtros de la UI
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const API_URL = import.meta.env.VITE_API_URL;

  // 3. Sincronización con el servidor Railway
  const fetchAsistencias = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/api/asistencia`);
      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const data: AsistenciaBackend[] = await response.json();

      const transformados: Registro[] = data.map(item => {
        const fechaObj = new Date(item.fecha);
        return {
          id: item.id.toString(),
          alumno: item.numeroControl,
          nombre: item.nombre,
          grupo: item.grupo,
          turno: item.turno,
          tipo: item.evento === 'ENTRADA' ? 'Entrada' : 'Salida',
          hora: fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          fecha: fechaObj.toLocaleDateString('es-MX') // DD/MM/YYYY
        };
      });

      setRegistros(transformados);
    } catch (error) {
      console.error(error);
      toast.error("Error: No se pudo conectar con la base de datos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchAsistencias();
    const interval = setInterval(fetchAsistencias, 30000); // Pooling cada 30s
    return () => clearInterval(interval);
  }, []);

  // LÓGICA DE FILTRADO Y ESTADÍSTICAS

  const fechaHoyStr = new Date().toLocaleDateString('es-MX');

  // Estadísticas filtradas solo para Hoy
  const entradasHoyCount = registros.filter(r => r.tipo === 'Entrada' && r.fecha === fechaHoyStr).length;
  const salidasHoyCount = registros.filter(r => r.tipo === 'Salida' && r.fecha === fechaHoyStr).length;

  // Filtrado de la tabla según Selects
  const filteredRegistros = registros.filter(registro => {
    const grupoMatch = filtroGrupo === 'todos' || registro.grupo === filtroGrupo;
    const turnoMatch = filtroTurno === 'todos' || registro.turno.toUpperCase() === filtroTurno.toUpperCase();
    const tipoMatch = filtroTipo === 'todos' || registro.tipo.toLowerCase() === filtroTipo.toLowerCase();
    return grupoMatch && turnoMatch && tipoMatch;
  });

  // Función para exportar a CSV (Excel)
  const exportarCSV = () => {
    if (filteredRegistros.length === 0) return toast.error("No hay datos para exportar");

    const encabezados = "Fecha,Hora,Nombre,NumControl,Grupo,Turno,Movimiento\n";
    const filas = filteredRegistros.map(r =>
      `${r.fecha},${r.hora},${r.nombre},${r.alumno},${r.grupo},${r.turno},${r.tipo}`
    ).join("\n");

    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_asistencia_${fechaHoyStr.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reporte generado exitosamente");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header title="Panel Administrativo" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-[#2E6DA4]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>

          <div className="flex gap-2">
            <Button onClick={exportarCSV} variant="outline" className="gap-2 border-[#2E6DA4] text-[#2E6DA4]">
              <Download className="w-4 h-4" /> Exportar Reporte
            </Button>
            <Button onClick={fetchAsistencias} disabled={cargando} className="gap-2 bg-[#2E6DA4]">
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} /> Sincronizar
            </Button>
          </div>
        </div>

        {/* Tarjetas de Resumen de Hoy */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-1">Total Histórico</p>
            <p className="text-3xl font-bold">{registros.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 border-l-4 border-l-green-500">
            <p className="text-sm text-gray-500 mb-1">Entradas Hoy</p>
            <p className="text-3xl font-bold text-green-600">{entradasHoyCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 border-l-4 border-l-red-500">
            <p className="text-sm text-gray-500 mb-1">Salidas Hoy</p>
            <p className="text-3xl font-bold text-red-600">{salidasHoyCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-1">Estado de Red</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${cargando ? 'bg-yellow-400' : 'bg-green-500'}`} />
              <p className="font-medium">{cargando ? 'Sincronizando...' : 'Online'}</p>
            </div>
          </div>
        </div>

        {/* Sección de Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-600 mr-2">
            <Filter className="w-4 h-4" /> <span className="text-sm font-bold">Filtros:</span>
          </div>

          <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Grupo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los Grupos</SelectItem>
              {/* Mapear grupos únicos de los registros */}
              <SelectItem value="6A">6to A</SelectItem>
              <SelectItem value="6B">6to B</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroTurno} onValueChange={setFiltroTurno}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Turno" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Ambos Turnos</SelectItem>
              <SelectItem value="matutino">Matutino</SelectItem>
              <SelectItem value="vespertino">Vespertino</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Evento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="salida">Salidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de Registros en Tiempo Real */}
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-bold text-gray-700">Bitácora SCESA - CETIS 24</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b text-left">
                  <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Hora</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Alumno / Identificador</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Grupo</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Turno</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Movimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRegistros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <Clock className="w-4 h-4 text-gray-400" /> {reg.hora}
                      </div>
                      <span className="text-[10px] text-gray-400">{reg.fecha}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{reg.nombre}</span>
                        <span className="text-xs font-mono text-gray-500">{reg.alumno}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-700">{reg.grupo}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                        reg.turno === 'MATUTINO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {reg.turno}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {reg.tipo === 'Entrada' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <LogIn className="w-3 h-3" /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <LogOut className="w-3 h-3" /> Salida
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRegistros.length === 0 && !cargando && (
              <div className="p-10 text-center text-gray-400">No se encontraron registros con los filtros aplicados.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}