"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const { setToken } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        const res = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "ログインに失敗しました");
            return;
        }

        // 🔹 トークンを保存
        setToken(data.token);

        // 🔹 ダッシュボードへ遷移
        router.push("/dashboard");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">ログイン</h1>
            {error && <p className="text-red-500">{error}</p>}
            <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 m-2 text-black"
            />
            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 m-2 text-black"
            />
            <button onClick={handleLogin} className="bg-blue-500 text-white p-2 mt-2">
                ログイン
            </button>
        </div>
    );
}