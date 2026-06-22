"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  userId: string;
  officeId?: string | null;
  officeName?: string | null;
}

export function DashboardClientLayout({
  children,
  userName,
  userRole,
  userId,
  officeId,
  officeName,
}: DashboardClientLayoutProps) {
  return (
    <DashboardLayout
      userName={userName}
      userRole={userRole}
      userId={userId}
      officeId={officeId}
      officeName={officeName}
    >
      {children}
    </DashboardLayout>
  );
}
