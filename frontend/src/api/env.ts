import axios from "axios";
export const API_BASE_URL = "http://10.247.225.87:8000";

export interface ApiError {
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  username: "Full name",
  email: "Email",
  phone: "Phone number",
  password: "Password",
};

// Turns FastAPI/axios errors (409 string detail, 422 detail array, network) into one shape.
export function extractApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return { message: "Something went wrong. Please try again." };
  }
  if (!error.response) {
    return {
      message: "Can't reach the server. Check your connection and try again.",
    };
  }

  const { status, data } = error.response;
  const detail = data?.detail;

  if (status === 422 && Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const item of detail) {
      const field = item.loc?.[item.loc.length - 1];
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = `${FIELD_LABELS[field] ?? field} is invalid.`;
      }
    }
    return {
      message: "Please check the highlighted fields.",
      status,
      fieldErrors,
    };
  }
  if (status === 409) {
    return {
      message: "An account with this email or phone already exists.",
      status,
    };
  }
  if (status >= 500) {
    return {
      message: "Our servers had a problem. Please try again shortly.",
      status,
    };
  }
  return {
    message: typeof detail === "string" ? detail : "Request failed.",
    status,
  };
}
