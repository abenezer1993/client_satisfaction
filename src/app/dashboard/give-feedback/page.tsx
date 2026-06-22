"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  Search,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Building2,
  Users,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  officeId: string | null;
  officeName: string | null;
}

interface Office {
  id: string;
  name: string;
  description: string | null;
  _count: { members: number; feedbackGiven: number };
}

interface Colleague {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  office?: { name: string } | null;
}

interface ServiceOption {
  id: string;
  name: string;
  category: { name: string } | null;
}

type Step = "select-office" | "select-user" | "give-feedback" | "success";

const ratingLabels = ["", "Poor", "Below Average", "Average", "Good", "Excellent"];

export default function GiveFeedbackPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Flow state
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [selectedUser, setSelectedUser] = useState<Colleague | null>(null);
  const [step, setStep] = useState<Step>("select-office");

  // Feedback form
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load session and offices on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [sessionRes, officesRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/offices"),
        ]);
        const sessionData: SessionUser = await sessionRes.json();
        const officesData: Office[] = await officesRes.json();

        setSession(sessionData);
        setOffices(officesData);

        // Non-global-admins skip office selection — auto-select their office
        if (sessionData?.role !== "GLOBAL_ADMIN" && sessionData?.officeId) {
          const userOffice = officesData.find((o) => o.id === sessionData.officeId);
          if (userOffice) {
            setSelectedOffice(userOffice);
            setStep("select-user");
          }
        }
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load users when an office is selected
  useEffect(() => {
    if (!selectedOffice) return;
    setLoading(true);

    fetch(`/api/users?officeId=${selectedOffice.id}`)
      .then((r) => r.json())
      .then((data: Colleague[]) => {
        // Exclude self
        setColleagues(
          data.filter((u) => u.id !== session?.id && u.isActive)
        );
      })
      .catch(() => setColleagues([]))
      .finally(() => setLoading(false));
  }, [selectedOffice, session?.id]);

  // Load services when a user is selected (use their office)
  useEffect(() => {
    if (!selectedUser || !selectedOffice) {
      setServices([]);
      return;
    }

    fetch(`/api/services?officeId=${selectedOffice.id}`)
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]));
  }, [selectedUser, selectedOffice]);

  // ── Handlers ──

  const handleSelectOffice = (office: Office) => {
    setSelectedOffice(office);
    setSearch("");
    setStep("select-user");
  };

  const handleSelectUser = (user: Colleague) => {
    setSelectedUser(user);
    setRating(0);
    setComment("");
    setServiceId("");
    setError("");
    setStep("give-feedback");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !selectedUser || !selectedOffice) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          targetUserId: selectedUser.id,
          officeId: selectedOffice.id,
          serviceId: serviceId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnother = () => {
    setSelectedUser(null);
    setSelectedOffice(null);
    setColleagues([]);
    setRating(0);
    setComment("");
    setServiceId("");
    setError("");
    setSearch("");
    setStep("select-office");
  };

  const filteredColleagues = colleagues.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Group services by category
  const groupedServices = services.reduce<Record<string, ServiceOption[]>>(
    (acc, s) => {
      const catName = s.category?.name || "Other";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(s);
      return acc;
    },
    {}
  );

  // ── Loading ──
  if (loading && offices.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Success Screen ──
  if (step === "success") {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <Card className="text-center animate-scale-in">
          <CardContent className="pt-12 pb-10">
            <div className="rounded-full bg-emerald-50 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Feedback Submitted!
            </h2>
            <p className="text-slate-600 mb-2">
              Your feedback for <strong>{selectedUser?.name}</strong> has been
              recorded.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              They will be notified and can respond to your feedback.
            </p>

            <div className="flex justify-center gap-1 mb-8">
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
              <Button onClick={handleSubmitAnother} variant="primary">
                Submit Another Feedback
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard/feedback")}
              >
                View All Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Give Feedback Form ──
  if (step === "give-feedback" && selectedUser && selectedOffice) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <button
          onClick={() => {
            setSelectedUser(null);
            setStep("select-user");
          }}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to colleague selection
        </button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-base">
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  Rate your experience with {selectedUser.name}
                </CardTitle>
                <p className="text-sm text-slate-500 mt-0.5">
                  {selectedUser.email}
                  {selectedOffice && ` · ${selectedOffice.name}`}
                  {selectedUser.role &&
                    ` · ${ROLE_LABELS[selectedUser.role] || selectedUser.role.replace("_", " ")}`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3 border border-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rating */}
              <div className="space-y-2">
                <Label className="text-base">Rating</Label>
                <div className="flex items-center gap-2">
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
                  {rating > 0 && (
                    <span className="ml-2 text-sm font-medium text-slate-600">
                      {ratingLabels[rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Service Selection */}
              {services.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="feedback-service">
                    Service Received{" "}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Select value={serviceId} onValueChange={setServiceId}>
                    <SelectTrigger id="feedback-service">
                      <SelectValue placeholder="Select the service you received" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific service</SelectItem>
                      {Object.entries(groupedServices).map(
                        ([categoryName, categoryServices]) => (
                          <div key={categoryName}>
                            {categoryName !== "Other" && (
                              <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {categoryName}
                              </div>
                            )}
                            {categoryServices.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </div>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="feedback-comment">
                  Comments{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="feedback-comment"
                  placeholder="What went well? What could be improved?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null);
                    setStep("select-user");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={rating === 0 || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Select User (Colleague) ──
  if (step === "select-user" && selectedOffice) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        {/* Header with back and office info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {session?.role === "GLOBAL_ADMIN" && (
              <button
                onClick={() => {
                  setSelectedOffice(null);
                  setStep("select-office");
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedOffice.name}
              </h2>
              <p className="text-sm text-slate-500">
                {colleagues.length} team member{colleagues.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : colleagues.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="rounded-full bg-slate-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No colleagues found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                There are no other active users in this office to rate.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Colleagues list */}
            {filteredColleagues.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-slate-500">No colleagues match your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredColleagues.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200 text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {ROLE_LABELS[user.role] || user.role.replace("_", " ")}
                      </span>
                      <Star className="h-4 w-4 text-slate-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Select Office ──
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Give Feedback</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose an office to find a colleague to rate
        </p>
      </div>

      {offices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="rounded-full bg-slate-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No offices available
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              There are no offices configured yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {offices.map((office) => (
            <button
              key={office.id}
              onClick={() => handleSelectOffice(office)}
              className="w-full flex items-center gap-4 p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200 text-left"
            >
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-900">
                  {office.name}
                </p>
                <p className="text-sm text-slate-500">
                  {office._count.members} member{office._count.members !== 1 ? "s" : ""}
                  {office.description && ` · ${office.description}`}
                </p>
              </div>
              <Star className="h-5 w-5 text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
