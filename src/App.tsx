import { useState } from 'react';
import logo from './assets/logo2.png';
import {
  FileText,
  BarChart3,
  Database,
  History,
  // PencilLine,
} from 'lucide-react';
import { MasterDataProvider } from '@/context/MasterDataContext';
import { DailyEntryProvider } from '@/context/DailyEntryContext';
import DailyEntry from '@/sections/DailyEntry';
import Analytics from '@/sections/Analytics';
import MasterData from '@/sections/MasterData';
import HistoryView from '@/sections/HistoryView';
// import UpdateDailyEntry from '@/sections/UpdateDailyEntry';
import { Toaster } from '@/components/ui/sonner';

type ViewType = 'daily-entry' | 'update-entry' | 'analytics' | 'master-data' | 'history';

const navigation = [
  { id: 'daily-entry', label: 'DWM Entry', icon: FileText },
  // { id: 'update-entry', label: 'Update Entry', icon: PencilLine },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'master-data', label: 'Master Data', icon: Database },
  { id: 'history', label: 'History', icon: History },
] as const;

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('daily-entry');
  // const [userMenuOpen, setUserMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'daily-entry':  return <DailyEntry />;
      // case 'update-entry': return <UpdateDailyEntry />;
      case 'analytics':    return <Analytics />;
      case 'master-data':  return <MasterData />;
      case 'history':      return <HistoryView />;
      default:             return <DailyEntry />;
    }
  };

  return (
    <MasterDataProvider>
      <DailyEntryProvider>
        <Toaster position="top-right" richColors />
        <div className="min-h-screen flex flex-col" style={{ background: '#dbd8d8ff' }}>

          {/* ═══ Top Navigation Bar ═══ */}
          <header className="sticky top-0 z-50 border-b border-white/10 dark-bg" style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <div className="flex items-center justify-between px-6 h-16">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 flex items-center bg-gray-400 rounded-lg">
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


            </div>
          </header>

          {/* ═══ Page Content ═══ */}
          <main className="flex-1 p-4 overflow-auto">
            {renderView()}
          </main>
        </div>
      </DailyEntryProvider>
    </MasterDataProvider>
  );
}

export default App;
