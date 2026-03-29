/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../lib/api";
import { syncGuestCartToServer } from "../lib/guestCart";
import type { LoginInput, RegisterInput, User } from "../types";

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput, redirectTo?: string) => Promise<void>;
  register: (input: RegisterInput, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedSession = useRef(false);

  const refreshUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const nextUser = await fetchMe();
      startTransition(() => {
        setUser(nextUser);
      });
      queryClient.setQueryData(["user"], nextUser);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const login = async (
    input: LoginInput,
    redirectTo = "/home"
  ): Promise<void> => {
    const nextUser = await loginRequest(input);
    await syncGuestCartToServer();
    startTransition(() => {
      setUser(nextUser);
    });
    queryClient.setQueryData(["user"], nextUser);
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    navigate(redirectTo);
  };

  const register = async (
    input: RegisterInput,
    redirectTo = "/home"
  ): Promise<void> => {
    const nextUser = await registerRequest(input);
    await syncGuestCartToServer();
    startTransition(() => {
      setUser(nextUser);
    });
    queryClient.setQueryData(["user"], nextUser);
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    navigate(redirectTo);
  };

  const logout = async (): Promise<void> => {
    await logoutRequest();
    startTransition(() => {
      setUser(null);
    });
    queryClient.setQueryData(["user"], null);
    queryClient.removeQueries({ queryKey: ["cart"] });
    queryClient.removeQueries({ queryKey: ["orders"] });
    navigate("/home");
  };

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;
    void refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
