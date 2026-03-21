import { createContext, useContext } from "react";
import { AuthContext as AuthContextType } from "@/types/auth.types";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => Promise.resolve(false),
  OTP_signup: async () => Promise.resolve(false),
  verifyOTP: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    code: string,
  ) => Promise.resolve(false),
  logout: () => {},
  loading: false,
});

const useAuthContext = () => useContext(AuthContext);

export default useAuthContext;
