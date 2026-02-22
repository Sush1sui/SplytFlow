import { createContext, useContext } from "react";
import type { AuthContext as AuthContextType } from "../types/auth";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
