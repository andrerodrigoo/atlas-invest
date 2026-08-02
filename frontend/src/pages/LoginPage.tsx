import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, ErrorBanner, Input } from "@/components/ui";
import { ApiError } from "@/api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("teste@atlasinvest.com.br");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível fazer login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-primary">
      <div className="max-w-sm mx-auto w-full fade-in">
        <div className="text-center mb-8">
          <img src="/icon.svg" alt="Atlas Invest" className="w-16 h-16 mx-auto mb-3 rounded-2xl" />
          <h1 className="text-2xl font-bold text-white">Atlas Invest</h1>
          <p className="text-gray-300 text-sm mt-1">
            Educação financeira e investimentos com IA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark rounded-xl2 p-6 space-y-4 shadow-lg">
          <ErrorBanner message={erro} />

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">E-mail</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Senha</label>
            <Input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary dark:text-gold font-semibold">
              Cadastre-se
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-gray-300 mt-4">
          Use <b>teste@atlasinvest.com.br</b> / <b>Teste123</b> (usuário do seed) para testar rapidamente.
        </p>
      </div>
    </div>
  );
}
