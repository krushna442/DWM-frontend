import { useState } from 'react';
import logo from './assets/logo2.png'
import { 
  // LayoutDashboard, 
  FileText, 
  BarChart3, 
  Database, 
  History, 
  Menu,
  X,
  // ChevronDown,
  User,
  // LogOut,
  // Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  // DropdownMenu,
  // DropdownMenuContent,
  // DropdownMenuItem,
  // DropdownMenuSeparator,
  // DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MasterDataProvider } from '@/context/MasterDataContext';
import { DailyEntryProvider } from '@/context/DailyEntryContext';
import DailyEntry from '@/sections/DailyEntry';
import Analytics from '@/sections/Analytics';
import MasterData from '@/sections/MasterData';
import HistoryView from '@/sections/HistoryView';

type ViewType = 'dashboard' | 'daily-entry' | 'analytics' | 'master-data' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('daily-entry');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [

    { id: 'daily-entry', label: 'DWM Entry', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'master-data', label: 'Master Data', icon: Database },
    { id: 'history', label: 'History', icon: History },
  ] as const;

  const renderView = () => {
    switch (currentView) {
      case 'daily-entry':
        return <DailyEntry />;
      case 'analytics':
        return <Analytics />;
      case 'master-data':
        return <MasterData />;
      case 'history':
        return <HistoryView />;
      default:
        return <DailyEntry />;
    }
  };

  return (
    <MasterDataProvider>
      <DailyEntryProvider>
        <div className="min-h-screen bg-[#F8F8F8] flex">
          {/* Sidebar */}
          <aside 
            className={`fixed left-0 top-0 h-full bg-[#1A1A1A] z-50 transition-all duration-300 ${
              sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
            }`}
          >
            <div className=" flex items-center px-6 py2 border-b bg-gray-400 border-white/10">
                  <img src={logo} alt="Logo" className="" />
               
         
            </div>
            
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as ViewType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-[#C9A962] text-[#1A1A1A]'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">Plant Manager</p>
                  <p className="text-white/50 text-xs truncate">manager@plant.com</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
            {/* Header */}
            <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 sticky top-0 z-40">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-[#666666] hover:text-[#1A1A1A]"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                <h1 className="text-xl font-semibold text-[#1A1A1A]">
                  {navigation.find(n => n.id === currentView)?.label}
                </h1>
              </div>
              
              {/* <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-[#666666]">
                      <Settings className="w-4 h-4" />
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> */}
            </header>

            {/* Page Content */}
            <div className="p-6">
              {renderView()}
            </div>
          </main>
        </div>
      </DailyEntryProvider>
    </MasterDataProvider>
  );
}

export default App;
