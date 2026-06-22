"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { Bell, Menu, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  userName: string;
  userRole: string;
  officeName?: string | null;
  onMenuClick: () => void;
}

export function Navbar({
  userName,
  userRole,
  officeName,
  onMenuClick,
}: NavbarProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-700"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm lg:text-base font-semibold text-slate-900">
            Welcome back, {userName.split(" ")[0]}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {ROLE_LABELS[userRole] || userRole}
            </Badge>
            {officeName && (
              <span className="text-xs text-slate-500">{officeName}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">
                {ROLE_LABELS[userRole] || userRole}
              </p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/api/auth/signout" className="cursor-pointer text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
