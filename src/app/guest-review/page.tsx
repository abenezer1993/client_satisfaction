"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_NAME } from "@/lib/constants";
import { Star, CheckCircle2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GuestReviewPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState<string>("none");
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [offices, setOffices] = useState<any[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("none");
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("none");
  const [loadingOffices, setLoadingOffices] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [usersRes, officesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/offices")
        ]);

        if (usersRes.ok) {
          const data = await usersRes.json();
          const filteredUsers = data.filter((u: any) => u.isActive && u.role !== "GLOBAL_ADMIN");
          setUsers(filteredUsers);
        }

        if (officesRes.ok) {
          const data = await officesRes.json();
          const activeOffices = data.filter((o: any) => o.isActive);
          setOffices(activeOffices);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        setLoadingUsers(false);
        setLoadingOffices(false);
      }
    }
    fetchInitialData();
  }, []);

  // Synchronize targetUserId selection with office
  useEffect(() => {
    if (targetUserId === "none") {
      return;
    }
    const selectedUser = users.find((u) => u.id === targetUserId);
    if (selectedUser?.officeId) {
      setSelectedOfficeId(selectedUser.officeId);
    }
  }, [targetUserId, users]);

  // Fetch services when selectedOfficeId changes
  useEffect(() => {
    if (selectedOfficeId === "none") {
      setServices([]);
      setSelectedServiceId("none");
      return;
    }

    async function fetchServices() {
      setLoadingServices(true);
      try {
        const res = await fetch(`/api/services?officeId=${selectedOfficeId}`);
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Failed to load services:", err);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    }

    fetchServices();
    setSelectedServiceId("none");
  }, [selectedOfficeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    setError("");

    try {
      const officeId = selectedOfficeId && selectedOfficeId !== "none" ? selectedOfficeId : null;
      const serviceId = selectedServiceId && selectedServiceId !== "none" ? selectedServiceId : null;

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment || null,
          contactEmail: contactEmail || null,
          isAnonymous: !contactEmail,
          targetUserId: targetUserId && targetUserId !== "none" ? targetUserId : null,
          officeId: officeId,
          serviceId: serviceId,
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-scale-in text-center">
          <CardContent className="pt-12 pb-10">
            <div className="rounded-full bg-emerald-50 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Thank You!
            </h2>
            <p className="text-slate-600 mb-2">
              Your feedback has been submitted successfully.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Your insights help us improve and serve you better.
            </p>
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-6 w-6",
                    star <= rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200"
                  )}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild variant="primary">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setRating(0);
                  setComment("");
                  setContactEmail("");
                  setConsent(false);
                  setTargetUserId("none");
                  setSelectedOfficeId("none");
                  setSelectedServiceId("none");
                }}
              >
                Submit Another Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {APP_NAME}
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-lg overflow-hidden flex items-center justify-center mx-auto mb-4">
              <img src="/logo.jpg" alt="Logo" className="h-16 w-16 object-contain" />
            </div>
            <CardTitle className="text-xl">
              Share Your Experience
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              We value your feedback. Let us know how we&apos;re doing.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
                  {error}
                </div>
              )}

              {/* Staff Member Selection */}
              <div className="space-y-2">
                <Label htmlFor="targetUserId">Select Staff Member (Optional)</Label>
                <Select value={targetUserId} onValueChange={setTargetUserId}>
                  <SelectTrigger id="targetUserId">
                    <SelectValue placeholder={loadingUsers ? "Loading staff list..." : "Choose a staff member..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (General Feedback)</SelectItem>
                    {users.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} {u.office?.name ? `(${u.office.name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Office Selection */}
              <div className="space-y-2">
                <Label htmlFor="officeId">Select Office / Department (Optional)</Label>
                <Select
                  value={selectedOfficeId}
                  onValueChange={setSelectedOfficeId}
                  disabled={targetUserId !== "none"}
                >
                  <SelectTrigger id="officeId">
                    <SelectValue placeholder={loadingOffices ? "Loading offices..." : "Choose an office..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (General Feedback)</SelectItem>
                    {offices.map((o: any) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selection */}
              {selectedOfficeId !== "none" && (
                <div className="space-y-2">
                  <Label htmlFor="serviceId">Select Service Received (Optional)</Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger id="serviceId">
                      <SelectValue placeholder={loadingServices ? "Loading services..." : "Choose a service..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (General Service Feedback)</SelectItem>
                      {services.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} {s.category?.name ? `[${s.category.name}]` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-center block text-base">
                  How would you rate your experience?
                </Label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all duration-150 hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-10 w-10 transition-colors",
                          star <= (hoveredRating || rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-slate-600 font-medium">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Below Average"}
                    {rating === 3 && "Average"}
                    {rating === 4 && "Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">
                  Tell us more{" "}
                  <span className="text-slate-400 font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="comment"
                  placeholder="What stood out? How can we improve?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email{" "}
                  <span className="text-slate-400 font-normal">
                    (optional - for follow-ups)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  I consent to this feedback being shared with the relevant team
                  for quality improvement purposes.
                </span>
              </label>

              <Button
                type="submit"
                className="w-full"
                disabled={rating === 0 || !consent || loading}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>

              <p className="text-xs text-center text-slate-400">
                Your feedback is anonymous unless you provide your email.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
