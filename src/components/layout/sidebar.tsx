"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  FileText,
  Bell,
  ChevronLeft,
  X,
  LucideIcon,
  Star,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  role: string;
  officeId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, officeId, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const globalNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard/global", icon: LayoutDashboard },
    { label: "Offices", href: "/dashboard/global/offices", icon: Building2 },
    { label: "Users", href: "/dashboard/global/users", icon: Users },
    { label: "Give Feedback", href: "/dashboard/give-feedback", icon: Star },
    { label: "All Feedback", href: "/dashboard/feedback", icon: MessageSquare },
    { label: "Analytics", href: "/dashboard/global/analytics", icon: BarChart3 },
    { label: "Reports", href: "/dashboard/reports", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const officeNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: officeId ? `/dashboard/office/${officeId}` : "/dashboard/office",
      icon: LayoutDashboard,
    },
    { label: "Users", href: "/dashboard/office/users", icon: Users },
    { label: "Give Feedback", href: "/dashboard/give-feedback", icon: Star },
    { label: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
    { label: "Metrics", href: "/dashboard/office/metrics", icon: BarChart3 },
    { label: "Reports", href: "/dashboard/reports", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const userNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard/profile",
      icon: LayoutDashboard,
    },
    { label: "Give Feedback", href: "/dashboard/give-feedback", icon: Star },
    { label: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
    { label: "My Performance", href: "/dashboard/profile", icon: BarChart3 },
    { label: "Reports", href: "/dashboard/reports", icon: FileText },
  ];

  const navItems =
    role === "GLOBAL_ADMIN"
      ? globalNavItems
      : role === "OFFICE_ADMIN"
        ? officeNavItems
        : userNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-200 shrink-0">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-contain rounded-md shrink-0" />
            <span className="font-semibold text-xs text-slate-900 leading-tight break-words max-w-[150px]">{APP_NAME}</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href + '-' + item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-slate-200 space-y-1">
          <Link
            href="/dashboard/notifications"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="h-4.5 w-4.5" />
            Notifications
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <HelpCircle className="h-4.5 w-4.5" />
            Help & Support
          </Link>
        </div>
      </aside>
    </>
  );
}
