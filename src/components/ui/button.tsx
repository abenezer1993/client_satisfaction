import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm":
              variant === "primary",
            "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300":
              variant === "secondary",
            "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100":
              variant === "outline",
            "text-slate-600 hover:bg-slate-100 hover:text-slate-900":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm":
              variant === "danger",
          },
          {
            "text-xs px-2.5 py-1.5 h-8": size === "sm",
            "text-sm px-4 py-2 h-10": size === "md",
            "text-base px-6 py-3 h-12": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
