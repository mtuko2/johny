import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getToken, authLogin, type User } from '../api';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('quantum_user');
    return u ? JSON.parse(u) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await authLogin(email, password);
    localStorage.setItem('quantum_token', t);
    localStorage.setItem('quantum_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('quantum_token');
    localStorage.removeItem('quantum_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      login, 
      logout, 
      isAuthenticated: !!token,
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
