// src/pages/ProfilePage.tsx
import { useAuth } from "@/context/AuthContext";

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">👤 Your Profile</h2>
      <p className="mb-2">
        <strong>Email:</strong> {user?.email}
      </p>
      <p className="text-muted-foreground text-sm">
        More features coming soon...
      </p>
    </div>
  );
};
