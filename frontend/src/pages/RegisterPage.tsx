import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, ErrorBanner, Input } from "@/components/ui";
import { ApiError } from "@/api/client";

export default function RegisterPage() {
  const { register, confirmEmail } = useAuth();
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState<"cadastro" | "confirmacao">("cadastro");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const { verificationToken } = await register(nome, email, senha);
      setVerificationToken(verificationToken ?? null);
      setEtapa("confirmacao");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message + (err.errors[0] ? ` (${err.errors[0]})` : "") : "Não foi possível cadastrar.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!verificationToken) return;
    setErro(null);
    setCarregando(true);
    try {
      await confirmEmail(verificationToken);
      navigate("/login");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível confirmar o e-mail.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-primary">
      <div className="max-w-sm mx-auto w-full fade-in">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {etapa === "cadastro" ? "Criar conta" : "Confirmar e-mail"}
        </h1>

        {etapa === "cadastro" ? (
          <form onSubmit={handleRegister} className="bg-white dark:bg-surface-dark rounded-xl2 p-6 space-y-4 shadow-lg">
            <ErrorBanner message={erro} />
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Nome</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">E-mail</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Senha</label>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número"
                required
              />
            </div>
            <Button type="submit" disabled={carregando}>
              {carregando ? "Enviando..." : "Cadastrar"}
            </Button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary dark:text-gold font-semibold">
                Entrar
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="bg-white dark:bg-surface-dark rounded-xl2 p-6 space-y-4 shadow-lg">
            <ErrorBanner message={erro} />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Em produção, enviaríamos um link de confirmação por e-mail (Parte 18 — ainda não
              integrado). Para testar agora, clique abaixo para confirmar automaticamente.
            </p>
            <Button type="submit" disabled={carregando || !verificationToken}>
              {carregando ? "Confirmando..." : "Confirmar e-mail e continuar"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
