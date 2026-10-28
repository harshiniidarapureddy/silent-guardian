import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap shrink-0";
    
    const variants = {
      default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
      outline: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
      ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    };

    const sizes = {
      default: "h-10 px-4 py-2 rounded-xl text-sm",
      sm: "h-8 px-3 rounded-lg text-xs",
      lg: "h-12 px-6 rounded-2xl text-base",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
