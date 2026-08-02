import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/api/client";

interface User {
  id: string;
  email: string;
  status: string;
  idioma: string;
  profile?: { nomeCompleto?: string | null };
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<{ verificationToken?: string }>;
  confirmEmail: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregarUsuario() {
    const token = localStorage.getItem("atlas_access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<User>("/users/me");
      setUser(me);
    } catch {
      localStorage.removeItem("atlas_access_token");
      localStorage.removeItem("atlas_refresh_token");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsuario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, senha: string) {
    const data = await api.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", { email, senha }, false);

    localStorage.setItem("atlas_access_token", data.accessToken);
    localStorage.setItem("atlas_refresh_token", data.refreshToken);
    setUser(data.user);
  }

  async function register(nome: string, email: string, senha: string) {
    const data = await api.post<{ id: string; email: string; verificationToken?: string }>(
      "/auth/register",
      { nome, email, senha, aceiteTermos: true },
      false
    );
    return { verificationToken: data.verificationToken };
  }

  async function confirmEmail(token: string) {
    await api.post("/auth/confirm-email", { token }, false);
  }

  function logout() {
    localStorage.removeItem("atlas_access_token");
    localStorage.removeItem("atlas_refresh_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, confirmEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
