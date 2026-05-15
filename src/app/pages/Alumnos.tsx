import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ArrowLeft, UserPlus, Search, Edit, Trash2, Users, RefreshCw, Hash, Save, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useRef } from 'react';

interface Alumno {
  numeroControl: string;
  nombreCompleto: string;
  grado: number;
  grupo: string;
  turno: string;
  nombreTutor: string;
  emailTutor: string;
}

export function Alumnos() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(true);

  // ESTADOS PARA EDICIÓN
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');

  const [formData, setFormData] = useState({
    numeroControl: '',
    nombreCompleto: '',
    grado: '',
    grupo: '',
    turno: '',
    nombreTutor: '',
    emailTutor: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // 1. Cargar alumnos
  const fetchAlumnos = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/api/alumnos`);
      if (!response.ok) throw new Error('Error al obtener el padrón');
      const data = await response.json();
      setAlumnos(data);
    } catch (error) {
      toast.error("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  // 2. Función para Eliminar
  const eliminarAlumno = async (nc: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${API_URL}/api/alumnos/${nc}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Alumno eliminado correctamente");
        fetchAlumnos();
      } else {
        const errorMsg = await res.text();
        toast.error(`Error: ${errorMsg}`);
      }
    } catch (error) {
      toast.error("No se pudo eliminar al alumno");
    }
  };

  // 3. Preparar Edición (Llena el formulario con los datos existentes)
  const prepararEdicion = (alumno: Alumno) => {
    setFormData({
      numeroControl: alumno.numeroControl,
      nombreCompleto: alumno.nombreCompleto,
      grado: alumno.grado.toString(),
      grupo: alumno.grupo,
      turno: alumno.turno,
      nombreTutor: alumno.nombreTutor,
      emailTutor: alumno.emailTutor
    });
    setEditingId(alumno.numeroControl);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Cancelar Formulario (Limpia estados)
  const cancelarFormulario = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingId('');
    setFormData({ numeroControl: '', nombreCompleto: '', grado: '', grupo: '', turno: '', nombreTutor: '', emailTutor: '' });
  };

  // 5. Guardar (POST o PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      grado: parseInt(formData.grado)
    };

    try {
      // Si estamos editando usamos PUT, si no usamos POST
      const url = isEditing ? `${API_URL}/api/alumnos/${editingId}` : `${API_URL}/api/alumnos`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(isEditing ? "Datos actualizados" : "Alumno registrado");
        cancelarFormulario();
        fetchAlumnos();
      } else {
        const errorMsg = await response.text();
        toast.error(`Error: ${errorMsg}`);
      }
    } catch (error) {
      toast.error("Error de conexión al guardar");
    }
  };

  const filteredAlumnos = alumnos.filter(alumno =>
    alumno.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alumno.numeroControl.includes(searchTerm)
  );

// 1. Crea la referencia para el input de archivo
const fileInputRef = useRef<HTMLInputElement>(null);

// 2. Función que se dispara cuando se selecciona un archivo
const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // FormData para enviar archivos por HTTP
  const formData = new FormData();
  formData.append("file", file);

  try {
    toast.loading("Procesando archivo CSV...", { id: "import" });


    const response = await fetch(`${API_URL}/api/alumnos/importar`, {
      method: 'POST',
      body: formData
    });

    const msg = await response.text();

    if (response.ok) {
      toast.success(msg, { id: "import" });
      fetchAlumnos(); // Refrescar la tabla para ver los nuevos datos
    } else {
      toast.error(`Error: ${msg}`, { id: "import" });
    }
  } catch (error) {
    toast.error("Error de conexión al importar", { id: "import" });
  } finally {
    // Limpiar el input para volver a subir el mismo archivo si es necesario
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header title="Gestión de Alumnos" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-[#2E6DA4] hover:text-[#2E6DA4]/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel Principal
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAlumnos} disabled={cargando}>
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </Button>

            {/* Input oculto controlado por el botón */}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImportCSV}
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-[#1A3A5C] text-[#1A3A5C] hover:bg-slate-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>

            <Button
              onClick={() => showForm ? cancelarFormulario() : setShowForm(true)}
              className="bg-[#1A3A5C] hover:bg-[#1A3A5C]/90 text-white"
            >
              {showForm ? 'Cancelar' : <><UserPlus className="w-4 h-4 mr-2" /> Nuevo Alumno</>}
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-6">
                {isEditing ? `Editando Alumno: ${editingId}` : 'Registrar Nuevo Alumno'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Número de Control</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.numeroControl}
                      disabled={isEditing} // No dejamos cambiar el NC si estamos editando
                      onChange={(e) => setFormData({ ...formData, numeroControl: e.target.value })}
                      placeholder="Ej. 2134567890"
                      className="pl-10 bg-white border-gray-300 disabled:bg-gray-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Nombre Completo</label>
                  <Input
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    placeholder="Apellido Paterno Materno Nombre(s)"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Grado</label>
                  <Select value={formData.grado} onValueChange={(v) => setFormData({ ...formData, grado: v })}>
                    <SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Grado" /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(g => <SelectItem key={g} value={g.toString()}>{g}° Semestre</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Grupo</label>
                  <Input
                    value={formData.grupo}
                    onChange={(e) => setFormData({ ...formData, grupo: e.target.value.toUpperCase() })}
                    placeholder="Ej. A, B, C"
                    maxLength={1}
                    className="bg-white border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Turno</label>
                  <Select value={formData.turno} onValueChange={(v) => setFormData({ ...formData, turno: v })}>
                    <SelectTrigger className="bg-white border-gray-300"><SelectValue placeholder="Turno" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matutino">Matutino</SelectItem>
                      <SelectItem value="Vespertino">Vespertino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Nombre del Tutor</label>
                  <Input
                    value={formData.nombreTutor}
                    onChange={(e) => setFormData({ ...formData, nombreTutor: e.target.value })}
                    placeholder="Nombre completo del tutor"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Email del Tutor</label>
                  <Input
                    type="email"
                    value={formData.emailTutor}
                    onChange={(e) => setFormData({ ...formData, emailTutor: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={cancelarFormulario}>Cancelar</Button>
                <Button type="submit" className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white gap-2">
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Guardar Cambios' : 'Registrar Alumno'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1E1E1E]">Alumnos en Sistema ({filteredAlumnos.length})</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o No. Control..."
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-[#F5F7FA]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">No. Control</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Grupo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Turno</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1E1E1E]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumnos.map((alumno) => (
                  <tr key={alumno.numeroControl} className="border-b border-gray-100 hover:bg-[#F5F7FA] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2E6DA4] rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-[#1E1E1E]">{alumno.nombreCompleto}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-[#6B7280]">{alumno.numeroControl}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{alumno.grado}°{alumno.grupo}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-[#2E6DA4] text-xs rounded">{alumno.turno}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => prepararEdicion(alumno)}
                            className="text-[#2E6DA4] hover:bg-blue-50"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarAlumno(alumno.numeroControl, alumno.nombreCompleto)}
                            className="text-[#EF4444] hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAlumnos.length === 0 && !cargando && (
            <div className="text-center py-12 text-[#6B7280]">No se encontraron alumnos registrados.</div>
          )}
        </div>
      </main>
    </div>
  );
}