'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Menu, X, ChevronDown, Heart, Star, MessageSquare, Settings, RefreshCw, LogOut, Trash2, PauseCircle } from 'lucide-react';

const user = {
  name: 'Jane Spoonfighter',
  email: 'janspoon@fighter.dev',
  image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
};

const tabs = [
  { label: 'Inicio', value: '/inicio' },
  { label: 'Órdenes', value: '/ordenes' },
  { label: 'Usuarios', value: '/usuarios' },
  { label: 'Reportes', value: '/reportes' },
];

function HeaderTabs() {
  // Mantine-style header, tabs centered, logo left, user right, dark bg
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const displayName = user?.nombre || user?.email || 'Usuario';
  const initials = useMemo(() => {
    const name = displayName.trim();
    if (!name) return 'U';
    const parts = name.split(' ');
    const a = parts[0]?.[0] || '';
    const b = parts[1]?.[0] || '';
    return (a + b).toUpperCase() || a.toUpperCase() || 'U';
  }, [displayName]);

  const isActive = (value: string) => {
    if (!pathname) return false;
    // Marca activa si coincide exactamente o es prefijo (para subrutas)
    return pathname === value || pathname.startsWith(value + '/');
  };

  const handleNavigate = (value: string) => {
    router.push(value);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try { await signOut(); } catch {}
    router.push('/autenticacion/login');
    setUserMenuOpen(false);
  };

  return (
    <header className="w-full bg-[#23272f] border-b border-[#23272f]">
      <div className="max-w-7xl mx-auto px-6 flex items-center h-20">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-[160px]">
          <Image src="/logo-cermont.png" alt="CERMONT" width={36} height={36} className="rounded-full" />
          <span className="text-2xl font-bold text-white tracking-wide">CERMONT</span>
        </div>
        {/* Tabs */}
        <nav className="flex-1 flex justify-center">
          <ul className="hidden md:flex gap-2">
            {tabs.map((tab) => (
              <li key={tab.value}>
                <button
                  className={`px-6 py-2 rounded-xl font-semibold text-base transition-all duration-150 focus:outline-none ${
                    isActive(tab.value)
                      ? 'bg-[#313843] text-white shadow border border-[#444c5a]'
                      : 'text-white/80 hover:bg-[#2a2f38] hover:text-white'
                  }`}
                  onClick={() => handleNavigate(tab.value)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
          {/* Mobile menu button */}
          <button className="md:hidden ml-2 p-2 rounded-lg hover:bg-[#2a2f38]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </nav>
        {/* User menu */}
        <div className="relative min-w-[180px] flex justify-end">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 ${userMenuOpen ? 'bg-[#313843]' : 'hover:bg-[#2a2f38]'}`}
            onClick={() => setUserMenuOpen((v) => !v)}
          >
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={displayName} width={32} height={32} className="rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2a2f38] text-white grid place-items-center text-xs font-semibold">
                {initials}
              </div>
            )}
            <span className="font-medium text-white hidden sm:block">{displayName}</span>
            <ChevronDown className={`w-4 h-4 text-white transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#23272f] rounded-xl shadow-2xl border border-[#313843] z-50 overflow-hidden animate-slideDown">
              <div className="px-4 py-3 border-b border-[#313843]">
                <p className="text-sm font-semibold text-white">{displayName}</p>
                {user?.email && (
                  <p className="text-xs text-white/60">{user.email}</p>
                )}
              </div>
              <div className="py-2">
                <MenuItem icon={<Heart className="w-4 h-4 text-red-500" />} label="Liked posts" />
                <MenuItem icon={<Star className="w-4 h-4 text-yellow-400" />} label="Saved posts" />
                <MenuItem icon={<MessageSquare className="w-4 h-4 text-blue-400" />} label="Your comments" />
              </div>
              <div className="py-2 border-t border-[#313843]">
                <div className="px-4 py-1 text-xs font-semibold text-white/60">SETTINGS</div>
                <MenuItem icon={<Settings className="w-4 h-4" />} label="Account settings" />
                <MenuItem icon={<RefreshCw className="w-4 h-4" />} label="Change account" />
                <MenuItem icon={<LogOut className="w-4 h-4" />} label="Logout" onClick={handleLogout} />
              </div>
              <div className="py-2 border-t border-[#313843]">
                <div className="px-4 py-1 text-xs font-semibold text-red-400">DANGER ZONE</div>
                <MenuItem icon={<PauseCircle className="w-4 h-4" />} label="Pause subscription" />
                <MenuItem icon={<Trash2 className="w-4 h-4 text-red-500" />} label="Delete account" danger />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#23272f] border-t border-[#313843] px-6 pb-4 animate-slideDown">
          <ul className="flex flex-col gap-2 mt-2">
            {tabs.map((tab) => (
              <li key={tab.value}>
                <button
                  className={`w-full px-6 py-2 rounded-xl font-semibold text-base transition-all duration-150 focus:outline-none ${
                    isActive(tab.value)
                      ? 'bg-[#313843] text-white shadow border border-[#444c5a]'
                      : 'text-white/80 hover:bg-[#2a2f38] hover:text-white'
                  }`}
                  onClick={() => handleNavigate(tab.value)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
}




// Menu Item Component
function MenuItem({ 
  icon, 
  label, 
  danger = false,
  onClick,
}: { 
  icon: React.ReactNode; 
  label: string; 
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`
        w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors
        ${
          danger
            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }
      `}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>

    </button>
  );
}

export default HeaderTabs;


