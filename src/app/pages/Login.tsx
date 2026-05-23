import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, User, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import logo from '@/assets/logo_cetis24.png';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<{ token: string, user: any }>('/api/login', {
        usuario,
        contrasena: password
      });

      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-[#ffffff] rounded-full flex items-center justify-center mx-auto mb-4 p-2 overflow-hidden shadow-sm">
            <img 
              src={logo}
              alt="Logo oficial del CETIS 24"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#1E1E1E] mb-2">Sistema SCESA</h1>
          <p className="text-[#6B7280]">Control de Entradas y Salidas para Alumnos</p>
          <p className="text-sm text-[#6B7280] mt-1">CETIS 24</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-[#EF4444] rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="pl-10 bg-white border-gray-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="pl-10 bg-white border-gray-300"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A3A5C] hover:bg-[#1A3A5C]/90 text-white font-medium py-6"
            >
              {loading ? 'Verificando...' : 'Ingresar al Sistema'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-[#F5F7FA] rounded-lg">
            <p className="text-xs text-[#6B7280] text-center">
              Solo personal autorizado con dispositivos registrados.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#6B7280] mt-6">
          © 2026 CETIS 24 - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
