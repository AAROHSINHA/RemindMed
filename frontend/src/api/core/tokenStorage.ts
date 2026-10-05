import * as SecureStore from "expo-secure-store";

type TokenKey = "access_token" | "refresh_token";

export const getToken = (key: TokenKey) => SecureStore.getItemAsync(key);

export const setToken = (key: TokenKey, value: string) =>
  SecureStore.setItemAsync(key, value);

export const saveTokens = async (access: string, refresh: string) => {
  await setToken("access_token", access);
  await setToken("refresh_token", refresh);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
};
