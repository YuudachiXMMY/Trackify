import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { getToken, setToken, clearToken } from '../services/auth';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existingToken = getToken();
    if (!existingToken) {
      setLoading(false);
      return;
    }

    api
      .get<User>('/api/auth/me')
      .then((me) => {
        setUser(me);
        setTokenState(existingToken);
      })
      .catch(() => {
        clearToken();
        setTokenState(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const result = await api.post<{ token: string; user: User }>('/api/auth/login', {
      email,
      password,
    });
    setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    const result = await api.post<{ token: string; user: User }>('/api/auth/register', {
      name,
      email,
      password,
    });
    setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
  };

  const logout = (): void => {
    clearToken();
    setTokenState(null);
    setUser(null);
    window.location.href = '/login';
  };

  const isLoggedIn = user !== null && token !== null;
  const userEmail = user?.email ?? null;

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, token, loading, login, signup, logout, userEmail }}
    >
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
