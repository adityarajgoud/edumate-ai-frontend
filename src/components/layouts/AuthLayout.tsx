// src/components/layouts/AuthLayout.tsx
import { Link } from "react-router-dom";
import { Brain } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4">
      <Link to="/" className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          EduMate AI
        </h1>
      </Link>

      <div className="w-full max-w-md bg-card p-6 rounded-xl shadow-md">
        {children}
      </div>
    </div>
  );
};
