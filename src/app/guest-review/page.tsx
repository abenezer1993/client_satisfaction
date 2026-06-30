"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/constants";
import {
  Star,
  CheckCircle2,
  Sparkles,
  Heart,
  Building2,
  Users,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ratingLabels = ["Poor", "Below Average", "Average", "Good", "Excellent"];

export default function GuestReviewPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");

  // Office & user selection
  const [offices, setOffices] = useState<any[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState("none");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("none");
  const [loadingOffices, setLoadingOffices] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load offices on mount
  useEffect(() => {
    async function fetchOffices() {
      try {
        const res = await fetch("/api/offices");
        if (res.ok) {
          const data = await res.json();
          setOffices(data.filter((o: any) => o.isActive));
        }
      } catch {
        // silently fail
      } finally {
        setLoadingOffices(false);
      }
    }
    fetchOffices();
  }, []);

  // Load users when office changes
  useEffect(() => {
    if (selectedOfficeId === "none") {
      setUsers([]);
      setSelectedUserId("none");
      return;
    }

    async function fetchUsers() {
      setLoadingUsers(true);
      setSelectedUserId("none");
      try {
        const res = await fetch(`/api/users?officeId=${selectedOfficeId}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.filter((u: any) => u.isActive && u.role !== "GLOBAL_ADMIN"));
        }
      } catch {
        // silently fail
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [selectedOfficeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment || null,
          contactEmail: email || null,
          isAnonymous: !email,
          targetUserId: selectedUserId !== "none" ? selectedUserId : null,
          officeId: selectedOfficeId !== "none" ? selectedOfficeId : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit feedback");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setSubmitted(false);
    setRating(0);
    setComment("");
    setEmail("");
    setSelectedOfficeId("none");
    setSelectedUserId("none");
    setError("");
  }, []);

  // ——— SUCCESS STATE ———
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-emerald-100/50 border border-emerald-100 p-10 text-center">
            <div className="relative mx-auto mb-8">
              <div className="rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 w-20 h-20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200/50 animate-fade-in">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-pulse" />
              <Heart className="absolute -bottom-1 -left-2 h-5 w-5 text-rose-400 animate-pulse delay-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2 animate-slide-up">
              Thank You!
            </h2>
            <p className="text-slate-600 mb-6 animate-slide-up delay-100">
              Your feedback helps us improve and serve you better.
            </p>

            <div className="flex justify-center gap-1.5 mb-8 animate-fade-in delay-200">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-7 w-7 transition-all duration-300",
                    star <= rating
                      ? "text-amber-400 fill-amber-400 scale-110"
                      : "text-slate-200"
                  )}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleReset}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/25"
              >
                Submit Another Review
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl h-11 border-slate-300"
              >
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ——— REVIEW FORM ———
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-100/40 to-cyan-100/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-100/30 to-orange-100/10 blur-3xl" />
      </div>

      <div
        className={cn(
          "w-full max-w-md relative transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header section with gradient */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 pt-10 pb-8 text-center relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 blur-xl" />

            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src="/logo.jpg" alt="" className="h-11 w-11 object-contain rounded-xl" />
              </div>
              <h1 className="text-xl font-bold text-white mb-1">
                Share Your Experience
              </h1>
              <p className="text-sm text-blue-200 max-w-xs mx-auto leading-relaxed">
                We value your feedback. Let us know how we&apos;re doing at{" "}
                {APP_NAME}.
              </p>
            </div>
          </div>

          {/* Form section */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="animate-scale-in bg-red-50 text-red-700 text-sm rounded-xl p-4 border border-red-200 flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-red-600">!</span>
                  </div>
                  <span>{error}</span>
                </div>
              )}

              {/* Office Selection */}
              <div className="space-y-1.5">
                <label htmlFor="office" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Office / Department
                </label>
                <div className="relative">
                  <select
                    id="office"
                    value={selectedOfficeId}
                    onChange={(e) => setSelectedOfficeId(e.target.value)}
                    className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 pr-10 text-sm text-slate-700 transition-all duration-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none"
                  >
                    <option value="none" disabled>
                      {loadingOffices ? "Loading offices..." : "Select an office..."}
                    </option>
                    {offices.map((o: any) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Staff Selection */}
              <div className="space-y-1.5">
                <label htmlFor="staff" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  Staff Member
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    id="staff"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    disabled={selectedOfficeId === "none"}
                    className={cn(
                      "w-full h-11 appearance-none rounded-xl border border-slate-200 px-4 pr-10 text-sm transition-all duration-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none",
                      selectedOfficeId !== "none"
                        ? "bg-slate-50/50 text-slate-700"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <option value="none">
                      {selectedOfficeId === "none"
                        ? "Select an office first"
                        : loadingUsers
                        ? "Loading staff..."
                        : "None (general feedback)"}
                    </option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] uppercase tracking-widest text-slate-300 font-medium">
                  Your Rating
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className={cn(
                        "transition-all duration-150 rounded-xl p-1 -m-1",
                        star <= (hoveredRating || rating)
                          ? "scale-110"
                          : "hover:scale-105"
                      )}
                      aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                    >
                      <Star
                        className={cn(
                          "h-12 w-12 sm:h-14 sm:w-14 transition-all duration-150",
                          star <= (hoveredRating || rating)
                            ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                            : "text-slate-200 fill-slate-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm font-semibold text-slate-700 animate-fade-in">
                    {ratingLabels[rating - 1]}
                  </p>
                )}
                {rating === 0 && (
                  <p className="text-center text-xs text-slate-400">
                    Tap a star to rate
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] uppercase tracking-widest text-slate-300 font-medium">
                  Optional
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label
                  htmlFor="comment"
                  className="text-sm font-medium text-slate-700"
                >
                  Tell us more
                  <span className="text-slate-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <Textarea
                  id="comment"
                  placeholder="What stood out? How can we improve?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="rounded-xl border-slate-200 bg-slate-50/50 text-sm transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 resize-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email
                  <span className="text-slate-400 font-normal ml-1">
                    (optional — for follow-ups)
                  </span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <Button
                type="submit"
                disabled={rating === 0 || loading}
                className={cn(
                  "w-full h-12 rounded-xl text-base font-semibold transition-all duration-200",
                  rating > 0
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </Button>

              <p className="text-center text-xs text-slate-400">
                Your feedback is anonymous unless you provide your email.
              </p>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 animate-fade-in delay-500">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
