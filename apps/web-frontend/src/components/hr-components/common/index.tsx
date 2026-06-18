import React, { ReactNode, forwardRef } from "react";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";

// ─── PAGE HEADER ───────────────────────────────────────────────
export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ─── CARD ──────────────────────────────────────────────────────
export const Card: React.FC<{
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  noPadding?: boolean;
}> = ({ children, className = "", title, action, noPadding }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between px-5 pt-5 pb-0">
        {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);

// ─── STAT CARD ─────────────────────────────────────────────────
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: number; label: string };
  isLoading?: boolean;
}> = ({ label, value, icon, iconBg = "bg-indigo-50", iconColor = "text-indigo-600", trend, isLoading }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      {isLoading ? (
        <div className="h-7 w-20 bg-slate-100 rounded animate-pulse mt-1" />
      ) : (
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      )}
      {trend && !isLoading && (
        <p className={`text-xs mt-1 font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  </div>
);

// ─── BADGE ─────────────────────────────────────────────────────
type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50  text-amber-700",
  danger:  "bg-red-50    text-red-600",
  info:    "bg-blue-50   text-blue-700",
  neutral: "bg-slate-100 text-slate-600",
  purple:  "bg-indigo-50 text-indigo-700",
};

export const Badge: React.FC<{ variant?: BadgeVariant; children: ReactNode }> = ({
  variant = "neutral", children,
}) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_CLASSES[variant]}`}>
    {children}
  </span>
);

// ─── BUTTON ────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize    = "xs" | "sm" | "md" | "lg";

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary:   "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
  danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
};

const BTN_SIZES: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1    text-xs gap-1",
  sm: "px-3   py-1.5  text-sm gap-1.5",
  md: "px-4   py-2    text-sm gap-2",
  lg: "px-5   py-2.5  text-base gap-2",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: ReactNode;
  }
>(({ variant = "primary", size = "md", isLoading, leftIcon, children, className = "", disabled, ...rest }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`}
    disabled={disabled || isLoading}
    {...rest}
  >
    {isLoading ? <Loader2 size={14} className="animate-spin" /> : leftIcon}
    {children}
  </button>
));
Button.displayName = "Button";

// ─── INPUT ─────────────────────────────────────────────────────
export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }
>(({ label, error, hint, id, className = "", ...rest }, ref) => (
  <div className="space-y-1">
    {label && <label htmlFor={id} className="block text-xs font-semibold text-slate-600">{label}</label>}
    <input
      ref={ref}
      id={id}
      className={`block w-full px-3 py-2 text-sm border rounded-lg outline-none transition bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
        error ? "border-red-400 focus:ring-red-400" : "border-slate-300"
      } ${className}`}
      {...rest}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
));
Input.displayName = "Input";

// ─── TEXTAREA ──────────────────────────────────────────────────
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ label, error, id, className = "", ...rest }, ref) => (
  <div className="space-y-1">
    {label && <label htmlFor={id} className="block text-xs font-semibold text-slate-600">{label}</label>}
    <textarea
      ref={ref}
      id={id}
      rows={3}
      className={`block w-full px-3 py-2 text-sm border rounded-lg outline-none transition bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
        error ? "border-red-400" : "border-slate-300"
      } ${className}`}
      {...rest}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";

// ─── SELECT ────────────────────────────────────────────────────
export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
  }
>(({ label, error, id, options, placeholder = "Select…", className = "", ...rest }, ref) => (
  <div className="space-y-1">
    {label && <label htmlFor={id} className="block text-xs font-semibold text-slate-600">{label}</label>}
    <select
      ref={ref}
      id={id}
      className={`block w-full px-3 py-2 text-sm border rounded-lg outline-none transition bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
        error ? "border-red-400" : "border-slate-300"
      } ${className}`}
      {...rest}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Select.displayName = "Select";

// ─── TABLE ─────────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns, data, isLoading, emptyMessage = "No records found.",
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-slate-100 transition-colors ${onRowClick ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50/50"}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className ?? ""}`}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── PAGINATION ────────────────────────────────────────────────
export const Pagination: React.FC<{
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (p: number) => void;
}> = ({ page, totalPages, total, perPage, onPageChange }) => {
  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 text-sm text-slate-500">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                p === page ? "bg-indigo-600 text-white" : "hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── MODAL ─────────────────────────────────────────────────────
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}> = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
  if (!isOpen) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
        {footer && (
          <div className="px-6 pb-6 pt-2 flex justify-end gap-2 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── TOOLBAR ───────────────────────────────────────────────────
export const Toolbar: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`flex flex-wrap items-center gap-3 mb-4 ${className}`}>{children}</div>
);

// ─── SEARCH INPUT ──────────────────────────────────────────────
export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "Search…" }) => (
  <div className="relative flex items-center">
    <svg className="absolute left-2.5 text-slate-400 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg w-60 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
    />
  </div>
);

// ─── ACTION ICON BUTTON ────────────────────────────────────────
export const IconBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "danger" | "success";
  }
> = ({ variant = "default", className = "", children, ...rest }) => {
  const colors = {
    default: "text-slate-500 hover:bg-slate-100 hover:text-indigo-600",
    danger:  "text-slate-500 hover:bg-red-50 hover:text-red-600",
    success: "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600",
  };
  return (
    <button
      className={`p-1.5 rounded-lg transition-colors ${colors[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

// ─── EMPTY STATE ───────────────────────────────────────────────
export const EmptyState: React.FC<{
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <div className="text-slate-300">{icon}</div>
    <h3 className="font-semibold text-slate-600">{title}</h3>
    {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
    {action}
  </div>
);

// ─── ERROR BANNER ──────────────────────────────────────────────
export const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({
  message, onRetry,
}) => (
  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="underline underline-offset-2 text-red-600 hover:text-red-800 font-medium"
      >
        Retry
      </button>
    )}
  </div>
);

// ─── FORM ROW ──────────────────────────────────────────────────
export const FormRow: React.FC<{ children: ReactNode; cols?: 2 | 3 }> = ({
  children, cols = 2,
}) => (
  <div className={`grid gap-4 ${cols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
    {children}
  </div>
);

// ─── LOADING SPINNER ───────────────────────────────────────────
export const Spinner: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <Loader2 className={`animate-spin text-indigo-600 ${className}`} />
);