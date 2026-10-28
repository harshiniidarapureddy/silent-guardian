import React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = "", children, ...props }) => {
  return (
    <label
      className={`text-xs font-semibold text-slate-700 tracking-wide uppercase ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};
