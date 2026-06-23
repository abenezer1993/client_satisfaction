"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateUserDialog } from "@/components/shared/create-user-dialog";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Search, Building2, Clock, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  office?: { name: string } | null;
}

const ROLE_STYLES: Record<string, string> = {
  GLOBAL_ADMIN: "bg-blue-50 text-blue-700",
  OFFICE_ADMIN: "bg-teal-50 text-teal-700",
  OFFICE_USER: "bg-slate-50 text-slate-600",
  EXTERNAL: "bg-purple-50 text-purple-700",
};

export default function GlobalUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: true } : u))
        );
      }
    } catch (err) {
      console.error("Failed to approve user:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setApprovingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error("Failed to reject user:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const pendingUsers = users.filter((u) => !u.isActive && u.role !== "GLOBAL_ADMIN");
  const activeUsers = users.filter((u) => u.isActive || u.role === "GLOBAL_ADMIN");

  const filteredActiveUsers = activeUsers.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.office?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 animate-pulse"><div className="h-8 w-32 bg-slate-200 rounded" /></div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">
            Manage all users across the organization
          </p>
        </div>
        <CreateUserDialog onUserCreated={fetchUsers} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Users" value={users.length} icon={Users} color="blue" />
        <KpiCard
          title="Active Users"
          value={users.filter((u) => u.isActive).length}
          icon={UserPlus}
          color="teal"
        />
        <KpiCard
          title="Pending Approval"
          value={pendingUsers.length}
          icon={Clock}
          color="amber"
        />
        <KpiCard
          title="Office Users"
          value={users.filter((u) => u.role === "OFFICE_USER" || u.role === "OFFICE_ADMIN").length}
          icon={Building2}
          color="slate"
        />
      </div>

      {/* Pending Approvals Section */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50/50 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base text-amber-900">
                Pending Approvals
              </CardTitle>
              <span className="ml-auto text-xs text-amber-600 font-medium">
                {pendingUsers.length} user{pendingUsers.length !== 1 ? "s" : ""} waiting
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    {user.office && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {user.office.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">
                      Pending
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => handleApprove(user.id)}
                      disabled={approvingId === user.id}
                    >
                      {approvingId === user.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleReject(user.id)}
                      disabled={approvingId === user.id}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {activeUsers.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or office..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Active Users List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">All Users</CardTitle>
          <span className="text-xs text-slate-400">
            {activeUsers.length} user{activeUsers.length !== 1 ? "s" : ""}
          </span>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div>
              <EmptyState
                title="No users yet"
                description="Create your first user or ask them to sign up."
              />
              <div className="flex justify-center -mt-4 pb-8">
                <CreateUserDialog onUserCreated={fetchUsers} />
              </div>
            </div>
          ) : filteredActiveUsers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No users match your search.
            </p>
          ) : (
            <div className="space-y-1">
              {filteredActiveUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {user.office && (
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {user.office.name}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ROLE_STYLES[user.role] || "bg-slate-50 text-slate-600"
                      }`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
