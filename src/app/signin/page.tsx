"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { Eye, EyeOff, Loader2, Clock } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-16 w-16 object-contain rounded-md" />
            <span className="text-xl font-bold text-slate-900 leading-tight text-center max-w-[280px]">
              {APP_NAME}
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
                  {error}
                </div>
              )}

              {pending && (
                <div className="bg-amber-50 text-amber-800 text-sm rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Account pending approval</p>
                      <p className="text-amber-700">
                        <strong>{pending.name}</strong>, your account has been created but is
                        still waiting for an administrator to approve it.
                        You&apos;ll receive access once approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
