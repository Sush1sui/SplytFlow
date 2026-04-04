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
  OTP_passwordReset: async () => Promise.resolve(false),
  verifyOTP: async (
    _firstName: string,
    _lastName: string,
    _email: string,
    _password: string,
    _confirmPassword: string,
    _code: string,
  ) => Promise.resolve(false),
  verifyPasswordResetOTP: async () => Promise.resolve(""),
  resetPassword: async () => Promise.resolve(),
  logout: () => {},
  updateProfile: async () => Promise.resolve(),
  updatePassword: async () => Promise.resolve(),
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
