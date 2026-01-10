import { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export type UserProfile = {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
};

export type AuthData = {
  session?: Session | null;
  profile?: UserProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setProfile: (
    value: React.SetStateAction<UserProfile | null | undefined>
  ) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthData>({
  session: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
  setProfile: () => {},
  setIsLoading: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
