import { router } from "expo-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { getMe, type UserData } from "@/api/auth";

const UserContext = createContext<UserData | null>(null);

// Loads the logged-in user once so every main tab (and the shared header) can read it.
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((e) => {
        if (e?.status === 401) router.replace("/auth/login");
      });
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
