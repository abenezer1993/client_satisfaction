"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import {
  ChevronRight,
  Star,
  Users,
  Building2,
  BarChart3,
  ArrowRight,
  Shield,
  MessageSquare,
  ExternalLink,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [showTour, setShowTour] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Logo" className="h-9 w-9 object-contain rounded-md" />
              <span className="font-semibold text-slate-900">{APP_NAME}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                How it Works
              </a>
              <a
                href="/help"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Help
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium mb-6">
                <Star className="h-3.5 w-3.5 fill-blue-500" />
                Enterprise-grade satisfaction tracking
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                {APP_TAGLINE}
                <span className="block text-blue-600 mt-2">
                  Across Your Organization
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mb-8 leading-relaxed">
                Capture, analyze, and act on client feedback across every level of
                your organization. From individual performance to global trends,
                make satisfaction your competitive advantage.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowTour(true)}
                >
                  Take a Tour
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link href="/guest-review">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Guest Review
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block animate-slide-up">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8 border border-slate-200">
                  {/* Hierarchy visualization */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Global Admin
                          </p>
                          <p className="text-xs text-slate-500">
                            Organization-wide oversight
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="h-8 w-0.5 bg-slate-300" />
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-teal-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-500 flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Office Admin
                          </p>
                          <p className="text-xs text-slate-500">
                            Regional management
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="h-8 w-0.5 bg-slate-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Star className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-900">
                              Office Users
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Rate & feedback
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <ExternalLink className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-900">
                              External
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Guest evaluators
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to track satisfaction
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From real-time analytics to closed-loop feedback, our platform gives
              you the tools to understand and improve client satisfaction.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "Hierarchical Structure",
                description:
                  "Model your organization exactly as it works — Global Admin, Office Admin, and Office Users with appropriate permissions at each level.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Star,
                title: "Multi-Level Ratings",
                description:
                  "Five-star rating system with rich qualitative feedback. Rate individuals, teams, or entire offices from a single interface.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: MessageSquare,
                title: "External Guest Reviews",
                description:
                  "Collect feedback from clients and partners without requiring them to sign up. Low friction, high response rates.",
                color: "bg-teal-50 text-teal-600",
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description:
                  "Live dashboards with trend lines, distribution charts, and heatmaps. Drill down from organization to individual performance.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Shield,
                title: "Closed-Loop Responses",
                description:
                  "Acknowledge, respond, and resolve feedback with follow-up tasks. Close the loop with timely, visible actions.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: Users,
                title: "Role-Based Access",
                description:
                  "Granular permissions ensure the right people see the right data. Audit trails keep you compliant.",
                color: "bg-teal-50 text-teal-600",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 animate-fade-in"
              >
                <div
                  className={`h-12 w-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get started in minutes. Configure your organization, invite your
              team, and start collecting actionable feedback.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Configure",
                description:
                  "Set up your organizational hierarchy — add offices, assign admins, and configure roles.",
              },
              {
                step: "2",
                title: "Collect",
                description:
                  "Users and external evaluators submit ratings and feedback through intuitive forms.",
              },
              {
                step: "3",
                title: "Improve",
                description:
                  "Analyze trends, assign follow-ups, and watch satisfaction scores improve over time.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center animate-slide-up">
                <div className="h-14 w-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your client satisfaction?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join organizations that use {APP_NAME} to understand and improve
            satisfaction across every level.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              <Link href="/signup">
                Start Free Trial
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-blue-400 text-white hover:bg-blue-700"
            >
              <Link href="/guest-review">Submit Guest Feedback</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.jpg" alt="Logo" className="h-9 w-9 object-contain rounded-md" />
                <span className="font-semibold text-white">{APP_NAME}</span>
              </div>
              <p className="text-sm">
                Clear. Actionable. Satisfaction.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-white transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Tour Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTour(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-scale-in">
            <button
              onClick={() => setShowTour(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Quick Tour
            </h3>
            <div className="space-y-6">
              {[
                {
                  title: "Configure Your Organization",
                  description:
                    "Set up offices, assign roles, and customize your hierarchy to match your real-world structure.",
                },
                {
                  title: "Collect Feedback",
                  description:
                    "Users rate peers and teams. External evaluators submit feedback without signing up.",
                },
                {
                  title: "Analyze & Act",
                  description:
                    "View real-time dashboards, identify trends, and close the loop with follow-up actions.",
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button className="w-full" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
