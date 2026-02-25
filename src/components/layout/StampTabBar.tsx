import { NavLink, useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, Target, User, Trophy, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { to: '/home', icon: Home, label: 'Home', isHero: false },
  { to: '/applications', icon: Briefcase, label: 'Applications', isHero: false },
  { to: '/track-record', icon: Trophy, label: 'Track Record', isHero: false },
  { to: '/contacts', icon: Users, label: 'Contacts', isHero: false },
  { to: '/goals', icon: Target, label: 'Goal Crusher', isHero: true },
  { to: '/profile', icon: User, label: 'Profile', isHero: false },
];

export function StampTabBar() {
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      className="stamp-bar fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center"
      style={{ height: isMobile ? 64 : 72 }}
    >
      {/* Paper texture overlay */}
      <div className="stamp-bar-texture" aria-hidden="true" />

      {/* Double border top */}
      <div className="stamp-bar-border-top" aria-hidden="true" />

      {/* Desktop logo */}
      {!isMobile && (
        <div className="stamp-logo" aria-hidden="true">
          <div className="stamp-logo-inner">
            <Heart className="h-5 w-5" />
            <span className="stamp-logo-text">Career Crush</span>
          </div>
        </div>
      )}

      <div className={cn(
        "stamp-items flex items-end flex-1",
        !isMobile && "ml-0"
      )}>
        {navItems.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to === '/applications' && location.pathname.startsWith('/applications'));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              className={cn(
                "stamp-unit",
                item.isHero && "stamp-hero",
                isActive && "stamp-active"
              )}
            >
              <div className="stamp-icon-wrap">
                <item.icon className="stamp-icon" />
                {item.isHero && !isActive && (
                  <Star className="stamp-hero-star" aria-hidden="true" />
                )}
              </div>
              {(!isMobile || isActive) && (
                <span className={cn(
                  "stamp-label",
                  item.isHero && "stamp-label-hero"
                )}>
                  {item.label}
                </span>
              )}
              {isActive && <div className="stamp-perforation" aria-hidden="true" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
