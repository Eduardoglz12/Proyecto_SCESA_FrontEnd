import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ArrowLeft, UserPlus, Trash2, Shield, User as UserIcon, RefreshCw, Save, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User } from '../../types';

export function Usuarios() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    role: 'operator' as 'admin' | 'operator',
    password: ''
  });

  const fetchUsuarios = async () => {
    try {
      setCargando(true);
      const data = await api.get<User[]>('/api/usuarios');
      setUsuarios(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // Solo admins pueden ver esta página
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
      toast.error("No tienes permisos para acceder a esta sección");
      return;
    }
    fetchUsuarios();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password.length < 6) {
      return toast.error("La contraseña debe tener al menos 6 caracteres");
    }

    try {
      await api.post('/api/usuarios', formData);
      toast.success("Usuario creado exitosamente");
      setShowForm(false);
      setFormData({ username: '', nombre: '', role: 'operator', password: '' });
      fetchUsuarios();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const eliminarUsuario = async (id: number, username: string) => {
    if (username === currentUser?.username) {
      return toast.error("No puedes eliminar tu propio usuario");
    }

    if (!confirm(`¿Estás seguro de eliminar al usuario ${username}?`)) return;

    try {
      await api.delete(`/api/usuarios/${id}`);
      toast.success("Usuario eliminado");
      fetchUsuarios();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header title="Gestión de Usuarios" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-[#2E6DA4]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsuarios} disabled={cargando}>
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#1A3A5C] hover:bg-[#1A3A5C]/90 text-white"
            >
              {showForm ? 'Cancelar' : <><UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario</>}
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md border p-8 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-6">Registrar Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Nombre Completo</label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Usuario (Login)</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                      placeholder="usuario123"
                      className="pl-10 bg-white border-gray-300"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min. 6 caracteres"
                      className="pl-10 bg-white border-gray-300"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Rol del Sistema</label>
                  <Select
                    value={formData.role}
                    onValueChange={(v: 'admin' | 'operator') => setFormData({ ...formData, role: v })}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator">Operador (Solo Registros)</SelectItem>
                      <SelectItem value="admin">Administrador (Acceso Total)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white gap-2">
                  <Save className="w-4 h-4" /> Crear Usuario
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F7FA] border-b">
                <th className="text-left p-4 text-sm font-bold text-[#1E1E1E]">Nombre</th>
                <th className="text-left p-4 text-sm font-bold text-[#1E1E1E]">Usuario</th>
                <th className="text-left p-4 text-sm font-bold text-[#1E1E1E]">Rol</th>
                <th className="text-right p-4 text-sm font-bold text-[#1E1E1E]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-[#1E1E1E]">{u.nombre || 'Sin nombre'}</td>
                  <td className="p-4 text-[#6B7280] font-mono">{u.username}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Shield className="w-3 h-3" /> {u.role === 'admin' ? 'Administrador' : 'Operador'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.username !== currentUser?.username && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => u.id && eliminarUsuario(u.id, u.username)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && !cargando && (
            <div className="p-10 text-center text-gray-400">No hay otros usuarios registrados.</div>
          )}
        </div>
      </main>
    </div>
  );
}
