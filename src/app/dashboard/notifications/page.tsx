"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell, CheckCheck, ArrowRight } from "lucide-react";

export default function NotificationsPage() {
  const [notifications] = useState<any[]>([]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated on feedback, tasks, and responses
          </p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent>
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="When you receive feedback or task assignments, they'll appear here."
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </div>
                  <span className="text-xs text-slate-400">{n.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
