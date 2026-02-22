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

export type AuthContext = {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContext>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
