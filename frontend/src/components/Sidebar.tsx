import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Files, 
  BarChart3, 
  History, 
  Settings, 
  HelpCircle, 
  Plus,
  Menu
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: MessageSquare, label: 'Chat', path: '/dashboard', id: 'sidebar-dashboard' },
  { icon: Files, label: 'Documents', path: '/documents', id: 'sidebar-documents' },
  { icon: BarChart3, label: 'Usage Stats', path: '/stats', id: 'sidebar-stats' },
  { icon: History, label: 'History', path: '/history', id: 'sidebar-history' },
];

export function Sidebar({ collapsed, setCollapsed, onNavigate }: { collapsed: boolean, setCollapsed: (v: boolean) => void, onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-surface-container-low border-r border-outline-variant/20 transition-all duration-200 ease-in-out z-40 relative",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Link to="/" onClick={handleLinkClick} className="block hover:opacity-80 transition-opacity">
            <h1 className="text-lg font-bold text-primary tracking-tight">DocuMind</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline font-semibold">The Modern Archivist</p>
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-surface-container rounded-lg transition-colors text-primary hidden lg:block"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 mb-8">
        <Link 
          to="/dashboard"
          onClick={handleLinkClick}
          className={cn(
            "crema-gradient text-white w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 font-medium",
            collapsed ? "px-0" : "px-4"
          )}
        >
          <Plus className="w-5 h-5" />
          {!collapsed && <span>New Chat</span>}
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              id={item.id}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                isActive 
                  ? "bg-surface-container text-primary font-semibold" 
                  : "text-secondary hover:bg-surface-container"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-secondary group-hover:text-primary")} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-outline-variant/10 flex items-center justify-around gap-2">
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className={cn(
            "p-3 rounded-xl transition-all hover:bg-surface-container text-secondary hover:text-primary flex items-center justify-center group",
            collapsed ? "w-12 h-12" : "flex-1 gap-2"
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>
        <Link
          to="/help"
          onClick={handleLinkClick}
          className={cn(
            "p-3 rounded-xl transition-all hover:bg-surface-container text-secondary hover:text-primary flex items-center justify-center group",
            collapsed ? "w-12 h-12" : "flex-1 gap-2"
          )}
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Help</span>}
        </Link>
      </div>
    </aside>
  );
}
