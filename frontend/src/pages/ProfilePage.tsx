import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, Card } from "@/components/ui";
import { Shield, User } from "@/components/icons";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Perfil</h1>

      <Card className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-gold/10 flex items-center justify-center">
          <User size={26} className="text-primary dark:text-gold" />
        </div>
        <div>
          <p className="font-semibold">{user?.profile?.nomeCompleto ?? "Usuário"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <Shield size={20} className="text-primary dark:text-gold" />
        <div>
          <p className="text-sm font-medium">Status da conta</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.status}</p>
        </div>
      </Card>

      <Button variant="ghost" onClick={handleLogout}>
        Sair da conta
      </Button>
    </div>
  );
}
