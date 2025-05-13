"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">ようこそ！</h1>
      <button
        onClick={() => router.push("/auth/signin")}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        ログイン
      </button>
      <button
        onClick={() => router.push("/auth/signup")}
        className="bg-gray-700 text-white px-4 py-2 rounded"
      >
        新規登録
      </button>
    </div>
  );
}