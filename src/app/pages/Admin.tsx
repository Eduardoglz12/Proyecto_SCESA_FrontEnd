import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ArrowLeft, Filter, Download, Clock, LogIn, LogOut, Users, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner'; // Usamos sonner que ya está en tu package.json

// 1. Definimos la interfaz que viene de tu Ktor
interface AsistenciaBackend {
  id: number;
  numeroControl: string;
  evento: string;
  fecha: string;
  operador: number;
}

// 2. Interfaz para la UI (Mantenemos compatibilidad con tu diseño)
interface Registro {
  id: string;
  alumno: string; // El número de control por ahora
  grupo: string;
  turno: string;
  tipo: 'Entrada' | 'Salida';
  hora: string;
  fecha: string;
}

export function Admin() {
  const navigate = useNavigate();
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Estado para los datos reales
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // 3. Función para traer datos del servidor
  const fetchAsistencias = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/api/asistencia`);
      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const data: AsistenciaBackend[] = await response.json();

      // Transformamos los datos del backend al formato de tu tabla
      const transformados: Registro[] = data.map(item => {
        const fechaObj = new Date(item.fecha);
        return {
          id: item.id.toString(),
          alumno: `Num. Control: ${item.numeroControl}`, // Luego podemos cruzar esto con nombres
          grupo: 'S/G', // Datos que no vienen en el endpoint de asistencia directamente
          turno: 'N/A',
          tipo: item.evento === 'ENTRADA' ? 'Entrada' : 'Salida',
          hora: fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          fecha: fechaObj.toLocaleDateString('es-MX')
        };
      });

      setRegistros(transformados);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo sincronizar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  // 4. Efecto para carga inicial y actualización automática (Pooling cada 30 segundos)
  useEffect(() => {
    fetchAsistencias();
    const interval = setInterval(fetchAsistencias, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredRegistros = registros.filter(registro => {
    const grupoMatch = filtroGrupo === 'todos' || registro.grupo === filtroGrupo;
    const turnoMatch = filtroTurno === 'todos' || registro.turno.toLowerCase() === filtroTurno;
    const tipoMatch = filtroTipo === 'todos' || registro.tipo.toLowerCase() === filtroTipo;
    return grupoMatch && turnoMatch && tipoMatch;
  });

  const handleExportData = () => {
    toast.success("Preparando descarga de reporte...");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header title="Panel Administrativo" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-[#2E6DA4] hover:text-[#2E6DA4]/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel Principal
          </Button>

          <Button
            onClick={fetchAsistencias}
            disabled={cargando}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            Sincronizar ahora
          </Button>
        </div>

        {/* Estadísticas en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Total Registros</p>
                <p className="text-3xl font-bold text-[#1E1E1E]">{registros.length}</p>
              </div>
              <div className="bg-[#2E6DA4] p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Entradas Hoy</p>
                <p className="text-3xl font-bold text-[#22C55E]">
                  {registros.filter(r => r.tipo === 'Entrada').length}
                </p>
              </div>
              <div className="bg-[#22C55E] p-3 rounded-lg">
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Salidas Hoy</p>
                <p className="text-3xl font-bold text-[#EF4444]">
                  {registros.filter(r => r.tipo === 'Salida').length}
                </p>
              </div>
              <div className="bg-[#EF4444] p-3 rounded-lg">
                <LogOut className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Estado API</p>
                <p className="text-lg font-bold text-[#1E1E1E] flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {cargando ? 'Actualizando...' : 'Conectado'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full animate-pulse ${cargando ? 'bg-yellow-400' : 'bg-[#22C55E]'}`}></div>
            </div>
          </div>
        </div>

        {/* (Sección de Filtros omitida en el snippet por brevedad, se mantiene igual que tu original) */}

        {/* Tabla de registros */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6">
            Registros en Tiempo Real - Railway
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-[#F5F7FA]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Identificador</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Grupo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Turno</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistros.map((registro) => (
                  <tr key={registro.id} className="border-b border-gray-100 hover:bg-[#F5F7FA] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-medium text-[#1E1E1E]">
                        <Clock className="w-4 h-4 text-[#6B7280]" />
                        {registro.hora}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#1E1E1E] font-mono text-sm">{registro.alumno}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{registro.grupo}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-[#2E6DA4] text-xs rounded">
                        {registro.turno}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {registro.tipo === 'Entrada' ? (
                        <span className="px-3 py-1 bg-green-100 text-[#22C55E] text-sm font-medium rounded flex items-center gap-1 w-fit">
                          <LogIn className="w-3 h-3" /> Entrada
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-[#EF4444] text-sm font-medium rounded flex items-center gap-1 w-fit">
                          <LogOut className="w-3 h-3" /> Salida
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {registros.length === 0 && !cargando && (
            <div className="text-center py-12">
              <p className="text-[#6B7280]">No hay registros en la base de datos de Railway todavía.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}