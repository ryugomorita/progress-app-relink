"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSWRConfig } from "swr";

type AddParentTaskProps = {
    closeModal: () => void;
};

export default function AddParentTask({ closeModal }: AddParentTaskProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const { token } = useAuth();
    const { mutate } = useSWRConfig();

    const handleAddTask = async () => {
        if (!token) {
            alert("認証エラー: トークンがありません");
            return;
        }
        if (!title) {
            alert("タイトルを入力してください");
            return;
        }

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    parentId: null,
                }),
            });

            if (!res.ok) throw new Error("追加に失敗しました");

            setTitle("");
            setDescription("");
            mutate("/api/tasks/hierarchy");
            closeModal(); // ✅ モーダル閉じる
        } catch (error) {
            console.error(error);
            alert("追加時にエラーが発生しました");
        }
    };

    return (
        <div className="p-4 border rounded mb-4 max-w-md">
            <h2 className="text-lg font-bold mb-2 text-black">新規タスク追加</h2>
            <input
                type="text"
                placeholder="タスクのタイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 mb-2 text-black"
            />
            <textarea
                placeholder="説明 (省略可)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 mb-2 text-black"
            />
            <button
                onClick={handleAddTask}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                追加
            </button>
        </div>
    );
}