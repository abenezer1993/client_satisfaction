"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_NAME } from "@/lib/constants";
import { Loader2, Building2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [officeId, setOfficeId] = useState("none");
  const [offices, setOffices] = useState<any[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch available offices for selection
  useEffect(() => {
    async function fetchOffices() {
      try {
        const res = await fetch("/api/offices");
        if (res.ok) {
          const data = await res.json();
          setOffices(data.filter((o: any) => o.isActive));
        }
      } catch (err) {
        console.error("Failed to load offices:", err);
      } finally {
        setLoadingOffices(false);
      }
    }
    fetchOffices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "OFFICE_USER", // Role is always OFFICE_USER on self-signup; admin promotes later
          officeId: officeId !== "none" ? officeId : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create account");
        return;
      }

      // Small delay to ensure session cookie is ready before redirect
      await new Promise((r) => setTimeout(r, 500));

      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!result?.error) {
          // Use full page navigation instead of client-side router.push
          // to ensure session cookie is picked up fresh by the server
          window.location.href = "/dashboard/profile";
          return; // Don't set success — we're navigating away
        }
      } catch {
        // Auto sign-in failed silently — user can click "Sign in manually"
        console.error("Auto sign-in failed:");
      }

      // If we get here, auto sign-in didn't succeed — show success message
      setSuccess(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-10">
            <div className="rounded-full bg-emerald-50 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Account created!
            </h2>
            <p className="text-slate-600 mb-2">
              You&apos;re being signed in automatically...
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Your role will be assigned by your administrator.
            </p>
            <Button asChild variant="outline">
              <Link href="/signin">Sign in manually</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Sign up to join your department and receive feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@nefassilk.edu.et"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-slate-400">At least 8 characters</p>
              </div>

              {/* Office selection */}
              <div className="space-y-2">
                <Label htmlFor="officeId">
                  Department / Office{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Select value={officeId} onValueChange={setOfficeId}>
                  <SelectTrigger id="officeId">
                    <SelectValue
                      placeholder={
                        loadingOffices
                          ? "Loading departments..."
                          : "Select your department..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Not assigned yet
                    </SelectItem>
                    {offices.map((o: any) => (
                      <SelectItem key={o.id} value={o.id}>
                        <span className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {o.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  Your role within the department will be assigned by an admin.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
