"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
    token: string | null;
    setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    // 🔹 ページリロード時に sessionStorage からトークンを復元
    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // 🔹 トークンが変更されるたびに sessionStorage に保存
    useEffect(() => {
        if (token) {
            sessionStorage.setItem("token", token);
        } else {
            sessionStorage.removeItem("token");
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
}

// 🔹 カスタムフックで簡単に `useAuth()` を利用できる
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}