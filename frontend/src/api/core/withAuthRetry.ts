import { AxiosResponse } from "axios";
import { extractApiError } from "../env";
import { refreshAccessToken } from "./refresh";
import { getToken } from "./tokenStorage";

type AxiosCall<T> = (token: string) => Promise<AxiosResponse<T>>;

// Runs an authenticated call; on a 401 (or missing access token) it refreshes once and retries.
export const withAuthRetry = async <T>(apiCall: AxiosCall<T>): Promise<T> => {
  let token = await getToken("access_token");

  if (token) {
    try {
      return (await apiCall(token)).data;
    } catch (error: any) {
      if (error?.response?.status !== 401) throw extractApiError(error);
    }
  }

  token = await refreshAccessToken();
  try {
    return (await apiCall(token)).data;
  } catch (error) {
    throw extractApiError(error);
  }
};
