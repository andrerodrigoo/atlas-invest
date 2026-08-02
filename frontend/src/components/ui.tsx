import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-primary/40 rounded-xl2 p-4 shadow-sm border border-gray-100 dark:border-primary-light/40 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-primary text-white hover:bg-primary-light disabled:opacity-50",
    secondary: "bg-secondary text-white hover:opacity-90 disabled:opacity-50",
    ghost: "bg-transparent text-primary dark:text-gold border border-primary dark:border-gold",
  };

  return (
    <button
      className={`w-full py-3 rounded-xl2 font-semibold transition-colors ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-xl2 border border-gray-300 dark:border-primary-light bg-white dark:bg-surface-dark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-gold ${className}`}
      {...props}
    />
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl2 px-4 py-3 text-sm fade-in">
      {message}
    </div>
  );
}

export function LoadingScreen({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] text-gray-500 dark:text-gray-300">
      {label}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-gray-400 dark:text-gray-500 text-sm text-center px-6">
      {label}
    </div>
  );
}
