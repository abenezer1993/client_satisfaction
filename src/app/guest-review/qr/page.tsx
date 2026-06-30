"use client";

import { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { Download, Printer, Smartphone, ArrowLeft, Copy } from "lucide-react";

export default function QRCodePage() {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const reviewUrl = `${origin}/guest-review`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "guest-review-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-teal-950 flex items-center justify-center p-4 print:bg-white">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-500/10 to-orange-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-teal-400/10 to-blue-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-6 print:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </a>

        {/* QR Card */}
        <div
          className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-8 sm:p-10 text-center"
          ref={qrRef}
        >
          {/* Logo */}
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img src="/logo.jpg" alt="" className="h-9 w-9 object-contain rounded-lg brightness-0 invert" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-1">
            Scan to Review
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Point your camera at the QR code to share your experience
          </p>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-4 inline-block mx-auto mb-6 shadow-inner border border-slate-100">
            {origin && (
              <QRCodeCanvas
                value={reviewUrl}
                size={240}
                level="M"
                className="rounded-lg"
              />
            )}
          </div>

          {/* URL display */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 mb-6">
            <Smartphone className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 truncate flex-1 text-left">
              {reviewUrl || "Loading..."}
            </span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
              title="Copy URL"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            {copied && (
              <span className="text-[10px] text-emerald-600 font-medium animate-fade-in">
                Copied!
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 print:hidden">
            <Button
              onClick={handleDownload}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25 text-sm"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 h-10 rounded-xl border-slate-300 text-sm"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 flex items-start gap-3 text-white/40 text-xs print:hidden animate-fade-in delay-300">
          <Smartphone className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Display this QR code in your office so clients can scan it with
            their phone camera to submit feedback — no app or registration
            needed.
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-8 print:hidden">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </div>
  );
}
