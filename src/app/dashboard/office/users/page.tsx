"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Users, UserPlus } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function OfficeUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users?officeId=${id}`)
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 animate-pulse"><div className="h-8 w-32 bg-slate-200 rounded" /></div>;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900">Office Users</h2>
      <p className="text-sm text-slate-500">Manage team members in this office</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <KpiCard title="Total Members" value={users.length} icon={Users} color="blue" />
        <KpiCard title="Active" value={users.filter((u) => u.isActive).length} icon={UserPlus} color="teal" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Members</CardTitle></CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <EmptyState title="No members" description="Add users to this office" />
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === "OFFICE_ADMIN" ? "bg-teal-50 text-teal-700" : "bg-slate-50 text-slate-600"
                  }`}>
                    {user.role === "OFFICE_ADMIN" ? "Admin" : "User"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
