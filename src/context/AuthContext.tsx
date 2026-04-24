import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'i-have-it-auth';

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const saveUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    (email: string) => {
      saveUser({ id: 'user-1', name: 'Demo User', email });
    },
    [saveUser],
  );

  const register = useCallback(
    (name: string, email: string) => {
      saveUser({ id: 'user-1', name, email });
    },
    [saveUser],
  );

  const logout = useCallback(() => {
    saveUser(null);
  }, [saveUser]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      login,
      register,
      logout,
    }),
    [login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
