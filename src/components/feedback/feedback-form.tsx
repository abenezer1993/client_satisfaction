"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceOption {
  id: string;
  name: string;
  category: { name: string } | null;
}

interface FeedbackFormProps {
  targetName?: string;
  targetUserId?: string;
  targetOfficeId?: string;
  onSubmit?: (rating: number, comment: string, serviceId?: string) => Promise<void>;
  isSubmitting?: boolean;
  showContactField?: boolean;
}

export function FeedbackForm({
  targetName,
  targetUserId,
  targetOfficeId,
  onSubmit,
  isSubmitting = false,
  showContactField = false,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Fetch services when targetUserId or targetOfficeId changes
  useEffect(() => {
    if (!targetUserId && !targetOfficeId) {
      setServices([]);
      return;
    }

    const officeId = targetOfficeId;
    if (!officeId) return;

    setLoadingServices(true);
    fetch(`/api/services?officeId=${officeId}`)
      .then((r) => r.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, [targetUserId, targetOfficeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    await onSubmit?.(rating, comment, serviceId || undefined);
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {targetName
            ? `Rate your experience with ${targetName}`
            : "Share your feedback"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
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
                      "h-8 w-8 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 fill-slate-200"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-slate-500">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Below Average"}
                  {rating === 3 && "Average"}
                  {rating === 4 && "Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Service Selection */}
          {targetName && (services.length > 0 || loadingServices) && (
            <div className="space-y-2">
              <Label htmlFor="service">
                Service Received{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger id="service">
                  <SelectValue
                    placeholder={
                      loadingServices
                        ? "Loading services..."
                        : "Select a service"
                    }
                  />
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
            <Label htmlFor="comment">
              Comments <span className="text-slate-400">(optional)</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Contact Email (for external evaluators) */}
          {showContactField && (
            <div className="space-y-2">
              <Label htmlFor="email">
                Email{" "}
                <span className="text-slate-400">
                  (optional - for follow-ups)
                </span>
              </Label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
