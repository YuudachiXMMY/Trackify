import { NavLink, useLocation, useNavigate } from 'react-router';
import { Home, ScanLine, MessageCircle, TrendingUp, User } from 'lucide-react';
import { useAuth } from './AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/scan', icon: ScanLine, label: 'Scan' },
  { to: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all"
              style={{
                color: isActive ? '#2D6A4F' : '#9CA3AF',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 600 }}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}