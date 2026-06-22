"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  userId: string;
  officeId?: string | null;
  officeName?: string | null;
}

export function DashboardLayout({
  children,
  userName,
  userRole,
  userId,
  officeId,
  officeName,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        role={userRole}
        officeId={officeId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar
          userName={userName}
          userRole={userRole}
          officeName={officeName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
