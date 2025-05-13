"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validatePassword = (pw: string) => {
        if (pw.length < 8) {
            return "パスワードは8文字以上にしてください";
        }
        if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
            return "パスワードには英字と数字の両方を含めてください";
        }
        return "";
    };

    const handleSignup = async () => {
        const error = validatePassword(password);
        if (error) {
            setPasswordError(error);
            return;
        }

        setPasswordError(""); // エラーをリセット

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (res.ok) {
            // alert("登録成功！ログインページへ移動します");
            router.push("/auth/signin");
        } else {
            alert("登録に失敗しました");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">サインアップ</h1>
            <input
                type="text"
                placeholder="名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 mb-2 text-black w-80"
            />
            <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 mb-2 text-black w-80"
            />
            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 mb-1 text-black w-80"
            />
            {passwordError && (
                <p className="text-red-500 text-sm mb-2">{passwordError}</p>
            )}
            <button
                onClick={handleSignup}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                登録
            </button>
        </div>
    );
}