"use client";

import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { token } = useAuth();
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">ダッシュボード</h1>
            {token ? <p>✅ ログイン中</p> : <p>🔴 未ログイン</p>}
            <button
                onClick={() => router.push("/tasks")}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                タスク管理へ移動
            </button>
            <button
                onClick={() => router.push("/")}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                ホームへ
            </button>
            <LogoutButton />
        </div>
    );
}