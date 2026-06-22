import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardClientLayout } from "./client-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = session.user as any;

  return (
    <DashboardClientLayout
      userName={user.name || ""}
      userRole={user.role || ""}
      userId={user.id || ""}
      officeId={user.officeId || null}
      officeName={user.officeName || null}
    >
      {children}
    </DashboardClientLayout>
  );
}
