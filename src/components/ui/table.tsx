import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className = "", children, ...props }) => (
  <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = "", children, ...props }) => (
  <thead className={`border-b border-slate-200 bg-slate-50/75 text-slate-500 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = "", children, ...props }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = "", children, ...props }) => (
  <tr className={`transition-colors hover:bg-slate-50/60 ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = "", children, ...props }) => (
  <th className={`h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = "", children, ...props }) => (
  <td className={`p-4 align-middle text-sm text-slate-800 ${className}`} {...props}>
    {children}
  </td>
);
