import { NavLink, useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, Target, Settings, Heart, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ButtonRetro } from '@/components/ui/button-retro';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/applications', icon: Briefcase, label: 'Applications' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b-2 border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-black text-lg">Career Crush</span>
        </div>
        <ButtonRetro size="icon" variant="ghost" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </ButtonRetro>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r-2 border-border transform transition-transform lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:flex flex-col"
      )}>
        <div className="p-6 border-b-2 border-border hidden lg:flex items-center gap-2">
          <Heart className="h-8 w-8 text-primary" />
          <span className="font-black text-xl">Career Crush</span>
        </div>
        <nav className="flex-1 p-4 pt-20 lg:pt-4 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-retro-sm"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-foreground/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
