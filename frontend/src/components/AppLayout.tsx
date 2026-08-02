import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Home, Wallet, MessageCircle, Newspaper, User } from "@/components/icons";

const navItems = [
  { to: "/dashboard", label: "Início", Icon: Home },
  { to: "/carteira", label: "Carteira", Icon: Wallet },
  { to: "/ia", label: "IA", Icon: MessageCircle },
  { to: "/noticias", label: "Notícias", Icon: Newspaper },
  { to: "/perfil", label: "Perfil", Icon: User },
];

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <main className="flex-1 fade-in">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-primary border-t border-gray-200 dark:border-primary-light flex justify-around py-2">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-xs rounded-lg transition-colors ${
                isActive
                  ? "text-primary dark:text-gold font-semibold"
                  : "text-gray-500 dark:text-gray-300"
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
