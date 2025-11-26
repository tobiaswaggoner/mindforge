"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "mindforge_auth";

// Mock user for development
const MOCK_USER: User = {
  id: "user-001",
  email: "admin@mindforge.de",
  name: "Admin User",
  role: "admin",
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.user) {
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, _password: string) => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock login - accepts any credentials
      const mockUser: User = {
        ...MOCK_USER,
        email,
        name: email.split("@")[0],
      };

      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mockUser }));
      setIsLoading(false);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, _password: string) => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: "editor",
      };

      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mockUser }));
      setIsLoading(false);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }, [router]);

  const forgotPassword = useCallback(async (_email: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    // In real implementation, this would send an email
  }, []);

  const resetPassword = useCallback(
    async (_token: string, _password: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      // In real implementation, this would reset the password
      router.push("/login");
    },
    [router]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
