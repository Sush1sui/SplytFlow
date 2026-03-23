import { createContext, useContext, useMemo } from "react";
import {
  AuthActions,
  AuthContext as AuthContextType,
  AuthState,
} from "@/types/auth.types";

const defaultAuthState: AuthState = {
  user: null,
  loading: false,
};

const defaultAuthActions: AuthActions = {
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
};

export const AuthStateContext = createContext<AuthState>(defaultAuthState);
export const AuthActionsContext =
  createContext<AuthActions>(defaultAuthActions);

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthActions = () => useContext(AuthActionsContext);

const useAuthContext = (): AuthContextType => {
  const state = useAuthState();
  const actions = useAuthActions();

  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
};

export default useAuthContext;
