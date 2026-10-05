import axios from "axios";
import { API_BASE_URL } from "../env";
import { clearTokens, getToken, saveTokens } from "./tokenStorage";

const SESSION_EXPIRED = { message: "Session expired. Please log in again.", status: 401 };

// Exchanges the refresh token for a new pair (rotation) and stores both.
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await getToken("refresh_token");
  if (!refreshToken) throw SESSION_EXPIRED;

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { timeout: 10000 },
    );
    await saveTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    await clearTokens();
    throw SESSION_EXPIRED;
  }
};
