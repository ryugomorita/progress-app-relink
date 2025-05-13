"use client";

import { signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const { setToken } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        setToken(null); // ✅ React の状態もリセット
        sessionStorage.removeItem("token"); // ✅ sessionStorage の削除も明示的に実行
        router.push("/auth/signin"); // ✅ ログアウト後にサインインページへリダイレクト
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
        >
            ログアウト
        </button>
    );
}