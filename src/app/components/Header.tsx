import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title: string;
  showLogout?: boolean;
}

export function Header({ title, showLogout = true }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('scesa_auth');
    navigate('/');
  };

  return (
    <header className="bg-[#1A3A5C] text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#1A3A5C] font-bold text-sm">CETIS</span>
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
              <span>Personal Autorizado</span>
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
