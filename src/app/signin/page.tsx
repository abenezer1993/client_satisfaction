"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
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

interface PendingState {
  isPending: boolean;
  name: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  OAuthSignin: "There was a problem signing in. Please try again.",
  OAuthCallback: "There was a problem signing in. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  EmailCreateAccount: "Could not create your account. Please try again.",
  Callback: "There was a problem with the sign-in callback.",
  OAuthAccountNotLinked: "This email is already associated with another sign-in method.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again.",
};

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
  const [pending, setPending] = useState<PendingState | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for error from URL (set by NextAuth redirect or middleware)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        const code = searchParams.get("code");
        if (code === "credentials") {
          setError("Invalid email or password. Check your credentials and try again.");
        } else {
          setError(ERROR_MESSAGES[errorParam]);
        }
      } else {
        setError(ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPending(null);

    try {
      // First, check if the user exists and is pending approval
      const checkRes = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      if (checkRes.ok) {
        const users = await checkRes.json();
        const found = users[0];
        if (found && !found.isActive) {
          setPending({ isPending: true, name: found.name });
          return;
        }
      }

      // Proceed with normal sign-in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] || ERROR_MESSAGES.Default);
        return;
      }

      // Fetch session to determine redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user) {
        const role = (session.user as any).role;
        const officeId = (session.user as any).officeId;

        if (role === "GLOBAL_ADMIN") router.push("/dashboard/global");
        else if (role === "OFFICE_ADMIN" && officeId)
          router.push(`/dashboard/office/${officeId}`);
        else router.push("/dashboard/profile");
      } else {
        router.push("/dashboard/profile");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
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
