import React, { createContext, useContext } from "react";
import type { ExtendedUser } from "~/models";

interface AuthContextType {
    user: ExtendedUser | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider: React.FC<{ user: ExtendedUser | null; children: React.ReactNode }> = ({ user, children }) => {
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
    return useContext(AuthContext);
} 