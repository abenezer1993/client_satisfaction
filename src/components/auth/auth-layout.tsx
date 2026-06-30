"use client";

import Link from "next/link";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from "@/lib/constants";
import {
  Star,
  BarChart3,
  Shield,
  ArrowRight,
} from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const features = [
  {
    icon: Star,
    text: "Multi-level ratings & feedback",
  },
  {
    icon: BarChart3,
    text: "Real-time satisfaction analytics",
  },
  {
    icon: Shield,
    text: "Secure role-based access control",
  },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950">
        {/* Mesh gradient overlays */}
        <div className="absolute inset-0">
          {/* Top-right warm glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/10 blur-3xl" />
          {/* Bottom-left cool glow */}
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-teal-400/15 to-blue-500/10 blur-3xl" />
          {/* Center accent */}
          <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-600/10 blur-2xl" />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating decorative orbs */}
        <div className="absolute top-[15%] left-[10%] w-20 h-20 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-300/10 blur-xl animate-pulse" />
        <div className="absolute bottom-[25%] right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-300/10 blur-xl animate-pulse delay-500" />
        <div className="absolute top-[55%] left-[60%] w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/15 to-orange-300/10 blur-lg animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo & Brand */}
          <div className="animate-fade-in">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all duration-300">
                <img src="/logo.jpg" alt="Logo" className="h-9 w-9 object-contain rounded-lg" />
              </div>
              <span className="text-lg font-semibold text-white/90">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Middle content */}
          <div className="space-y-8">
            <div className="space-y-4 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/70 text-xs font-medium">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                Enterprise Satisfaction Platform
              </div>
              <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                {APP_TAGLINE}
              </h1>
              <p className="text-base text-white/60 max-w-md leading-relaxed">
                {APP_DESCRIPTION}
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4 animate-slide-up delay-200">
              {features.map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats / social proof */}
            <div className="flex gap-8 animate-slide-up delay-300">
              {[
                { label: "Offices", value: "4+" },
                { label: "Users", value: "50+" },
                { label: "Uptime", value: "99.9%" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/30 animate-fade-in delay-500">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form Area */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {/* Mobile header (visible on small screens) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-slate-200 bg-white">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 object-contain rounded-md" />
            <span className="text-sm font-semibold text-slate-900">{APP_NAME}</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Back to home
          </Link>
        </div>

        {/* Desktop back link */}
        <div className="hidden lg:block absolute top-0 right-0 p-6 z-20">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Back to home
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-sm animate-fade-in">
            {/* Header */}
            <div className="mb-8 animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {title}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {subtitle}
              </p>
            </div>

            {/* Form */}
            <div className="animate-slide-up delay-100">
              {children}
            </div>

            {/* Mobile-only footer */}
            <p className="mt-8 text-center text-xs text-slate-400 lg:hidden">
              &copy; {new Date().getFullYear()} {APP_NAME}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
