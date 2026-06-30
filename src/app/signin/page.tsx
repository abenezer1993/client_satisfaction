"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth/auth-layout";
import { Eye, EyeOff, Loader2, Clock, AlertCircle } from "lucide-react";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for error or callbackUrl from URL
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setError("Invalid email or password. Please try again.");
    } else if (errorParam) {
      setError("An error occurred during sign in. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPending(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.code === "PENDING_APPROVAL") {
          setPending({ name: data.name || "Your account" });
          return;
        }
        setError(data.error || "Invalid email or password");
        return;
      }

      // Successful login - redirect based on role
      const user = data.user;
      const callbackUrl = searchParams.get("callbackUrl");

      if (callbackUrl && callbackUrl.startsWith("/")) {
        router.push(callbackUrl);
      } else if (user.role === "GLOBAL_ADMIN") {
        router.push("/dashboard/global");
      } else if (user.role === "OFFICE_ADMIN" && user.officeId) {
        router.push(`/dashboard/office/${user.officeId}`);
      } else {
        router.push("/dashboard/profile");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="animate-scale-in bg-red-50 text-red-700 text-sm rounded-xl p-4 border border-red-200 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {pending && (
          <div className="animate-scale-in bg-amber-50 text-amber-800 text-sm rounded-xl p-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium mb-1">Account pending approval</p>
                <p className="text-amber-700">
                  <strong>{pending.name}</strong>, your account has been created
                  but is still waiting for an administrator to approve it.
                  You&apos;ll receive access once approved.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 px-4 rounded-xl border-slate-300 bg-white text-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 px-4 rounded-xl border-slate-300 bg-white text-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 transition-all duration-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-50 px-3 text-slate-400">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
