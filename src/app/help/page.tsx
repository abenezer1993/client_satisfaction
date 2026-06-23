"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  ChevronRight,
} from "lucide-react";

export default function HelpPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Help Center
          </h1>
          <p className="text-slate-600 mb-8">
            Everything you need to get the most out of {APP_NAME}
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles, guides, and FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Link href="/signup" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base">Getting Started</CardTitle>
                <CardDescription>
                  Set up your organization and configure your hierarchy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-blue-600 font-medium flex items-center">
                  View guides <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/help" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center mb-2">
                  <HelpCircle className="h-5 w-5 text-teal-600" />
                </div>
                <CardTitle className="text-base">FAQs</CardTitle>
                <CardDescription>
                  Answers to common questions about using the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-teal-600 font-medium flex items-center">
                  Browse FAQs <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/feedback" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
                  <MessageCircle className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-base">Feedback Guide</CardTitle>
                <CardDescription>
                  Learn how to give and manage feedback effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-amber-600 font-medium flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </CardContent>
            </Card>
          </Link>

          <a href="mailto:support@nefassilk.edu.et" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center mb-2">
                  <Mail className="h-5 w-5 text-slate-600" />
                </div>
                <CardTitle className="text-base">Contact Support</CardTitle>
                <CardDescription>
                  Get in touch with our support team for help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-slate-600 font-medium flex items-center">
                  Contact us <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </CardContent>
            </Card>
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Onboarding Checklist
            </CardTitle>
            <CardDescription>
              Complete these steps to get your organization set up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  step: "Create your organization",
                  done: false,
                },
                {
                  step: "Add offices and configure hierarchy",
                  done: false,
                },
                {
                  step: "Invite team members and assign roles",
                  done: false,
                },
                {
                  step: "Configure evaluation forms and scoring",
                  done: false,
                },
                {
                  step: "Set up notification preferences",
                  done: false,
                },
                {
                  step: "Send your first feedback request",
                  done: false,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                      item.done
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-slate-300"
                    }`}
                  >
                    {item.done && (
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.done ? "text-slate-400 line-through" : "text-slate-700"
                    }`}
                  >
                    {item.step}
                  </span>
                </div>
              ))}
            </div>
            <Button className="mt-6 w-full">Start Onboarding Tour</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
