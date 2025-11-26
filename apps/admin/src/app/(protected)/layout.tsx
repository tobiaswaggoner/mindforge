"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { TopNav, MobileNav } from "@/components/layout";
import { TaskProvider } from "@/contexts/task-context";

function ProtectedLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userInfo = user
    ? {
        name: user.name,
        email: user.email,
        initials: user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }
    : undefined;

  return (
    <TaskProvider>
      <div className="flex min-h-screen flex-col bg-background pb-16 md:pb-0">
        <TopNav
          user={userInfo}
          onLogout={logout}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex flex-1">{children}</div>
        <MobileNav />
      </div>
    </TaskProvider>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
    </AuthProvider>
  );
}
