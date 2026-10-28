import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({ className = "", variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-teal-50 text-teal-800 border-teal-200",
    secondary: "bg-slate-100 text-slate-800 border-slate-200",
    destructive: "bg-red-50 text-red-800 border-red-200",
    outline: "border-slate-300 text-slate-700 bg-white",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
