export const pad = (value: number) => String(value).padStart(2, "0");

// "2026-10-11 09:00"
export const formatDateTime = (value: Date | number) => {
  const date = typeof value === "number" ? new Date(value) : value;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Parses "YYYY-MM-DD" as a local date (not UTC).
export const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
