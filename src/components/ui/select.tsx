import React, { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";

interface SelectContextType {
  value: string;
  onValueChange: (val: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  labelMap: Record<string, string>;
  registerLabel: (val: string, label: string) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

export interface SelectProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});

  const registerLabel = (val: string, label: string) => {
    setLabelMap((prev) => (prev[val] === label ? prev : { ...prev, [val]: label }));
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, labelMap, registerLabel }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={`flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${className}`}
    >
      {children}
      <ChevronDown size={16} className={`text-slate-400 transition-transform ${ctx?.open ? "rotate-180" : ""}`} />
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder = "Select option" }) => {
  const ctx = useContext(SelectContext);
  const display = ctx?.value ? (ctx.labelMap[ctx.value] || ctx.value) : placeholder;
  return <span className="truncate">{display}</span>;
};

export const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const ctx = useContext(SelectContext);
  if (!ctx?.open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => ctx.setOpen(false)} />
      <div className={`absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg sg-scrollbar ${className}`}>
        {children}
      </div>
    </>
  );
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className = "" }) => {
  const ctx = useContext(SelectContext);
  const selected = ctx?.value === value;

  React.useEffect(() => {
    if (typeof children === "string") {
      ctx?.registerLabel(value, children);
    }
  }, [value, children]);

  return (
    <div
      onClick={() => {
        ctx?.onValueChange(value);
        ctx?.setOpen(false);
      }}
      className={`flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm transition-colors ${
        selected ? "bg-teal-50 font-semibold text-teal-800" : "text-slate-700 hover:bg-slate-100"
      } ${className}`}
    >
      {children}
    </div>
  );
};
