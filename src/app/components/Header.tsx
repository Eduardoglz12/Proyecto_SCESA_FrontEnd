import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import logo from '@/assets/logo_cetis24.png';

interface HeaderProps {
  title: string;
  showLogout?: boolean;
}

export function Header({ title, showLogout = true }: HeaderProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[#1A3A5C] text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden">
            <img 
              src={logo}
              alt="Logo oficial del CETIS 24"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-xs text-white/80">CETIS 24 - Sistema SCESA</p>
          </div>
        </div>
        {showLogout && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span>{user?.username || 'Personal Autorizado'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#2E6DA4] hover:bg-[#2E6DA4]/90 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
