import { createContext, useContext } from "react";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthContextType = {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  OTP_signup: (email: string) => Promise<boolean>;
  verifyOTP: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    code: string,
  ) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

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
