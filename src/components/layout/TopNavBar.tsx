import { NavLink, useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, Target, User, Trophy, Heart, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/applications', icon: Briefcase, label: 'Applications' },
  { to: '/track-record', icon: Trophy, label: 'Track Record' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function TopNavBar() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="topnav sticky top-0 z-50 w-full border-b-2 border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 flex items-center h-14 sm:h-16 gap-2">
        {/* Logo */}
        <NavLink to="/home" className="flex items-center gap-2 shrink-0 mr-2 sm:mr-6 group">
          <motion.div
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-retro-sm"
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Heart className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
          </motion.div>
          {!isMobile && (
            <span className="font-black text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
              Career Crush
            </span>
          )}
        </NavLink>

        {/* Desktop nav links */}
        {!isMobile ? (
          <div className="flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to ||
                (item.to === '/applications' && location.pathname.startsWith('/applications'));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="relative"
                >
                  <motion.div
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-full"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        ) : (
          <>
            {/* Mobile: show current page + hamburger */}
            <div className="flex-1 flex items-center">
              {navItems.map(item => {
                const isActive = location.pathname === item.to ||
                  (item.to === '/applications' && location.pathname.startsWith('/applications'));
                if (!isActive) return null;
                return (
                  <span key={item.to} className="text-sm font-bold text-foreground flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </span>
                );
              })}
            </div>
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </>
        )}
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="overflow-hidden border-t border-border bg-card"
          >
            <div className="px-3 py-2 space-y-1">
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.to ||
                  (item.to === '/applications' && location.pathname.startsWith('/applications'));
                return (
                  <motion.div
                    key={item.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-retro-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
