"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthLayout from "@/components/auth/auth-layout";
import {
  Loader2,
  Building2,
  Clock,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function SignUpPage() {
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
          role: "OFFICE_USER",
          officeId: officeId !== "none" ? officeId : null,
          isActive: false, // New users require admin approval
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create account");
        return;
      }

      setSuccess(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 text-center">
            <div className="rounded-full bg-gradient-to-br from-amber-50 to-amber-100 w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Registration submitted!
            </h2>
            <p className="text-slate-600 mb-6">
              Your account is pending approval by an administrator.
            </p>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 mb-8 text-left text-sm space-y-3 border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 mb-0.5">What happens next?</p>
                  <p className="text-amber-700">
                    An administrator will review and approve your account. You&apos;ll
                    receive access once approved.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 mb-0.5">Need help?</p>
                  <p className="text-amber-700">
                    Contact your administrator or check back later to see if your
                    account has been approved.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/signin">Back to sign in</Link>
              </Button>
              <Button asChild className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25">
                <Link href="/">Go to home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your department and start receiving feedback"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="animate-scale-in bg-red-50 text-red-700 text-sm rounded-xl p-4 border border-red-200 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 px-4 rounded-xl border-slate-300 bg-white text-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@nefassilk.edu.et"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 px-4 rounded-xl border-slate-300 bg-white text-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-11 px-4 rounded-xl border-slate-300 bg-white text-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="flex items-center gap-1.5">
            {password.length >= 8 ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-slate-300" />
            )}
            <span className="text-xs text-slate-400">
              {password.length >= 8
                ? "Strong password"
                : "At least 8 characters"}
            </span>
          </div>
        </div>

        {/* Office selection */}
        <div className="space-y-2">
          <Label htmlFor="officeId" className="text-sm font-medium text-slate-700">
            Department / Office{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Select value={officeId} onValueChange={setOfficeId}>
            <SelectTrigger
              id="officeId"
              className="h-11 px-4 rounded-xl border-slate-300 bg-white text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
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

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <span>
              After signing up, an administrator must approve your account
              before you can sign in.
            </span>
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
              Creating account...
            </>
          ) : (
            "Create account"
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
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
