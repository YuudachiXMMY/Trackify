import React from 'react';
import { useLocation } from 'react-router';
import { BottomNav } from './BottomNav';
import { Wifi, Battery, Signal } from 'lucide-react';

export function MobileShell({ children, isOnboarding = false }: { children: React.ReactNode; isOnboarding?: boolean }) {
  const location = useLocation();
  const hideNav = isOnboarding || location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div
      className="flex w-full min-h-dvh items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}
    >
      <div
        className="relative flex flex-col bg-[#F8FAF9] w-full overflow-hidden"
        style={{
          maxWidth: '430px',
          height: '100dvh',
          maxHeight: '900px',
          borderRadius: 'clamp(0px, calc((100vw - 430px) * 9999), 48px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Simulated iOS status bar */}
        <div
          className="shrink-0 flex items-center justify-between px-7 bg-transparent z-50"
          style={{ height: '44px' }}
        >
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B4332', letterSpacing: '-0.3px' }}>9:41</span>
          <div className="flex items-center gap-1.5" style={{ color: '#1B4332' }}>
            <Signal size={13} strokeWidth={2.5} />
            <Wifi size={13} strokeWidth={2.5} />
            <Battery size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* Scrollable content area */}
        <div
          id="scroll-area"
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ scrollbarWidth: 'none' }}
        >
          {children}
        </div>

        {/* Bottom Navigation */}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}