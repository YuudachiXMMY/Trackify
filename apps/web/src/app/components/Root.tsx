import { useState } from 'react';
import { Outlet } from 'react-router';
import { OnboardingScreen } from './OnboardingScreen';
import { MobileShell } from './MobileShell';
import { AuthProvider } from './AuthContext';

export function Root() {
  const [onboarded, setOnboarded] = useState(
    localStorage.getItem('nourish_onboarded') === 'true' ||
    localStorage.getItem('nourish_logged_in') === 'true'
  );

  const handleOnboardingComplete = (name: string, goal: string) => {
    localStorage.setItem('nourish_onboarded', 'true');
    localStorage.setItem('nourish_name', name);
    localStorage.setItem('nourish_goal', goal);
    // Auto-login after onboarding
    localStorage.setItem('nourish_logged_in', 'true');
    setOnboarded(true);
  };

  return (
    <AuthProvider>
      {!onboarded ? (
        <MobileShell isOnboarding={true}>
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        </MobileShell>
      ) : (
        <MobileShell isOnboarding={false}>
          <Outlet />
        </MobileShell>
      )}
    </AuthProvider>
  );
}