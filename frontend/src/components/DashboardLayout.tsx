import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface-container-low border border-outline-variant/20 rounded-lg shadow-lg text-primary"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar - Responsive handling */}
      <div className={cn(
        "fixed inset-0 z-40 lg:relative lg:z-0 lg:flex transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          onNavigate={() => setIsMobileMenuOpen(false)} 
        />
      </div>

      <main className="flex-1 overflow-y-auto relative pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
