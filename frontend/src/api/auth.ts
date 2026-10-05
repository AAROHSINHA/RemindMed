import axios from "axios";
import { API_BASE_URL, extractApiError } from "./env";
import { clearTokens, saveTokens } from "./core/tokenStorage";
import { withAuthRetry } from "./core/withAuthRetry";

export interface SignupPayload {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface LoginPayload {
  identifier: string; // email or phone
  password: string;
}

// ---- Create Account ----
export const signupUser = async (payload: SignupPayload): Promise<UserData> => {
  try {
    const response = await axios.post<UserData>(`${API_BASE_URL}/auth/signup`, payload, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
};

// ---- Login (stores tokens) ----
export const loginUser = async (payload: LoginPayload) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, payload, {
      timeout: 10000,
    });
    await saveTokens(data.access_token, data.refresh_token);
  } catch (error) {
    throw extractApiError(error);
  }
};

// ---- Current user (auto-refreshes expired access token) ----
export const getMe = () =>
  withAuthRetry<UserData>((token) =>
    axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    }),
  );

export const logoutUser = clearTokens;

// ---- Check auth (refreshes an expired access token once) ----
export const checkAuth = () =>
  withAuthRetry<{ authenticated: boolean; user: UserData }>((token) =>
    axios.get(`${API_BASE_URL}/auth/check-auth`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    }),
  );
