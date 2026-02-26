import { createContext, useContext } from "react";
import type { AuthContext as AuthContextType } from "../types/auth";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => Promise.resolve(false),
  OTP_signup: (email: string) => Promise.resolve(false),
  verifyOTP: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    code: string,
  ) => Promise.resolve(false),
  logout: () => {},
  loading: true,
});

export const useAuthContext = () => useContext(AuthContext);
