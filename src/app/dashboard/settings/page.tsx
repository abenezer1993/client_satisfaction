"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Shield, Bell, Sliders } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure your preferences and system settings
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Sliders className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scoring Rules</CardTitle>
              <CardDescription>
                Configure how ratings and scores are calculated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Rating Scale</Label>
                  <p className="text-sm text-slate-500">
                    Default 1-5 star rating system
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium"
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Anonymous Feedback</Label>
                  <p className="text-sm text-slate-500">
                    Users can submit feedback anonymously
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow External Guest Reviews</Label>
                  <p className="text-sm text-slate-500">
                    Accept feedback from unauthenticated users
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "New Feedback",
                  description: "When you receive new feedback",
                },
                {
                  title: "Feedback Responses",
                  description: "When someone responds to your feedback",
                },
                {
                  title: "Task Assignments",
                  description: "When you're assigned a follow-up task",
                },
                {
                  title: "Weekly Summary",
                  description: "Weekly digest of your feedback activity",
                },
              ].map((item) => (
                <div key={item.title}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{item.title}</Label>
                      <p className="text-sm text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Retention</CardTitle>
              <CardDescription>
                Configure how long data is retained
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retention">Retention Period (days)</Label>
                <Input
                  id="retention"
                  type="number"
                  defaultValue={365}
                  className="w-32"
                />
                <p className="text-xs text-slate-400">
                  Feedback older than this will be automatically archived
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit Trail</Label>
                  <p className="text-sm text-slate-500">
                    Log all data access and modifications
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
