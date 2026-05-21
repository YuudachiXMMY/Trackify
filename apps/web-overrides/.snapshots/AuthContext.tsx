import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('nourish_logged_in') === 'true';
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('nourish_email');
  });

  const login = (email: string, password: string) => {
    // In a real app, this would validate credentials with a backend
    localStorage.setItem('nourish_logged_in', 'true');
    localStorage.setItem('nourish_email', email);
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const signup = (name: string, email: string, password: string) => {
    // In a real app, this would create an account with a backend
    localStorage.setItem('nourish_logged_in', 'true');
    localStorage.setItem('nourish_email', email);
    localStorage.setItem('nourish_name', name);
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem('nourish_logged_in');
    localStorage.removeItem('nourish_email');
    setIsLoggedIn(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, signup, logout, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
