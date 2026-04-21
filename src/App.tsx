import { useState, useEffect } from 'react';
import logo from './assets/logo2.png';
import {
  FileText,
  BarChart3,
  Database,
  History,
  PencilLine,
  LogOut,
  Loader2,
} from 'lucide-react';
import { MasterDataProvider } from '@/context/MasterDataContext';
import { DailyEntryProvider } from '@/context/DailyEntryContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import DailyEntry from '@/sections/DailyEntry';
import Analytics from '@/sections/Analytics';
import MasterData from '@/sections/MasterData';
import HistoryView from '@/sections/HistoryView';
import Login from '@/sections/Login';
import { Toaster } from '@/components/ui/sonner';
import UpdateDailyEntry from './sections/UpdateDailyEntry';
import { Button } from '@/components/ui/button';

type ViewType = 'daily-entry' | 'update-entry' | 'analytics' | 'master-data' | 'history';

const navigation = [
  { id: 'daily-entry', label: 'DWM Entry', icon: FileText },
  { id: 'update-entry', label: 'Update Entry', icon: PencilLine },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'master-data', label: 'Master Data', icon: Database },
  { id: 'history', label: 'History', icon: History },
] as const;

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('daily-entry');
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Ensure user lands on 'daily-entry' after logging in
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('daily-entry');
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-white/60 font-medium tracking-widest text-xs uppercase">Initializing System...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'daily-entry':  return <DailyEntry />;
      case 'update-entry': return <UpdateDailyEntry />;
      case 'analytics':    return <Analytics />;
      case 'master-data':  return <MasterData />;
      case 'history':      return <HistoryView />;
      default:             return <DailyEntry />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#dbd8d8ff' }}>
      {/* ═══ Top Navigation Bar ═══ */}
      <header className="sticky top-0 z-50 border-b border-white/10 dark-bg shadow-lg" style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div className="flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 flex items-center bg-gray-400 rounded-lg overflow-hidden">
                <img src={logo} alt="RSB Logo" className="h-10 object-contain" />
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A962] font-bold">Daily Work</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Management System</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewType)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group"
                  style={{
                    color: isActive ? '#C9A962' : 'rgba(255,255,255,0.6)',
                    background: isActive ? 'rgba(201,169,98,0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(201,169,98,0.3)' : '1px solid transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#C9A962] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-white/60 hover:text-red-400 hover:bg-red-400/10 gap-2 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ═══ Page Content ═══ */}
      <main className="flex-1 p-4 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <DailyEntryProvider>
          <Toaster position="top-right" richColors />
          <AppContent />
        </DailyEntryProvider>
      </MasterDataProvider>
    </AuthProvider>
  );
}

export default App;
