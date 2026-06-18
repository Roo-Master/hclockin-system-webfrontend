/** Format a date string to locale display */
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** Format a datetime string */
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Format a number as currency */
export const fmtCurrency = (amount: number, currency = "KES") =>
  `${currency} ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

/** Capitalise first letter */
export const capitalise = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

/** Get initials from a name */
export const initials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

/** Today's date as YYYY-MM-DD */
export const today = () => new Date().toISOString().split("T")[0];

/** First day of current month as YYYY-MM-DD */
export const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

/** Extract error message from axios error */
export const extractError = (err: unknown): string => {
  const axiosErr = err as { response?: { data?: { message?: string } } };
  return (
    axiosErr?.response?.data?.message ??
    (err instanceof Error ? err.message : "Something went wrong")
  );
};