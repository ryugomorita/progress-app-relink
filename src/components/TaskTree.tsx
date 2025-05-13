"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { useSWRConfig } from "swr";

type TaskTreeProps = {
    task: Task;
};

export default function TaskTree({ task }: TaskTreeProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || "");
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const { token } = useAuth();
    const { mutate } = useSWRConfig();

    const toggle = () => setIsOpen((prev) => !prev);

    return (
        <div className="ml-4 mt-2 border-l-2 border-gray-600 pl-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={toggle}>
                    {task.subTasks && task.subTasks.length > 0 ? (
                        <span>{isOpen ? "📂" : "📁"}</span>
                    ) : (
                        <span>📄</span>
                    )}
                    {/* ✅ チェックボックス追加ここ！ */}
                    <input
                        type="checkbox"
                        checked={task.status === "done"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={async (e) => {
                            if (!token) {
                                alert("認証エラー: トークンがありません");
                                return;
                            }

                            try {
                                const res = await fetch(`/api/tasks/${task.id}`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        status: e.target.checked ? "done" : "pending",
                                    }),
                                });

                                if (!res.ok) {
                                    throw new Error("ステータス更新に失敗しました");
                                }

                                mutate("/api/tasks/hierarchy");
                            } catch (error) {
                                console.error(error);
                                alert("ステータス更新時にエラーが発生しました");
                            }
                        }}
                    />
                    {!isEditing ? (
                        <span className={`font-semibold ${task.status === "done" ? "line-through text-gray-400" : ""}`}>
                            {task.title}
                        </span>
                    ) : (
                        <input
                            className="border p-1 text-black"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                    )}
                </div>
                <div className="w-1/3">
                    <div className="w-full bg-gray-700 rounded h-2 mb-1">
                        <div
                            className="bg-green-500 h-2 rounded"
                            style={{ width: `${task.progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-right text-gray-400">{task.progress.toFixed(1)}%</p>
                </div>
            </div>

            {/* 操作ボタン */}
            <div className="flex gap-2 mt-1 text-sm">
                {!isEditing ? (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                            編集
                        </button>
                        <button
                            onClick={async () => {
                                if (!token) {
                                    alert("認証エラー: トークンがありません");
                                    return;
                                }

                                const confirmed = window.confirm("このタスクを削除しますか？");
                                if (!confirmed) return;

                                try {
                                    const res = await fetch(`/api/tasks/${task.id}`, {
                                        method: "DELETE",
                                        headers: {
                                            "Authorization": `Bearer ${token}`,
                                        },
                                    });

                                    if (!res.ok) {
                                        throw new Error("削除に失敗しました");
                                    }

                                    // alert("削除成功！");
                                    mutate("/api/tasks/hierarchy");
                                } catch (error) {
                                    console.error(error);
                                    alert("削除時にエラーが発生しました");
                                }
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            削除
                        </button>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                            子タスク追加
                        </button>
                    </>
                ) : (
                    <>
                            <button
                                onClick={async () => {
                                    if (!token) {
                                        alert("認証エラー: トークンがありません");
                                        return;
                                    }

                                    try {
                                        const res = await fetch(`/api/tasks/${task.id}`, {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({
                                                title: editTitle,
                                                description: editDescription,
                                            }),
                                        });

                                        if (!res.ok) {
                                            throw new Error("更新に失敗しました");
                                        }

                                        // alert("更新成功！");
                                        setIsEditing(false);
                                        mutate("/api/tasks/hierarchy");
                                    } catch (error) {
                                        console.error(error);
                                        alert("更新時にエラーが発生しました");
                                    }
                                }}
                                className="bg-green-500 text-white px-2 py-1 rounded"
                            >
                                保存
                            </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditTitle(task.title);
                                setEditDescription(task.description || "");
                            }}
                            className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                            キャンセル
                        </button>
                    </>
                )}
            </div>

            {/* 追加フォーム */}
            {isAdding && (
                <div className="mt-2 ml-4">
                    <input
                        type="text"
                        placeholder="子タスクのタイトル"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="border p-1 text-black mb-1 w-full"
                    />
                    <textarea
                        placeholder="説明 (省略可)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="border p-1 text-black mb-1 w-full"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                if (!token) {
                                    alert("認証エラー: トークンがありません");
                                    return;
                                }

                                if (!newTitle) {
                                    alert("タイトルを入力してください");
                                    return;
                                }

                                try {
                                    const res = await fetch("/api/tasks", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({
                                            title: newTitle,
                                            description: newDescription,
                                            parentId: task.id, // ✅ ここがポイント！親のIDを指定
                                        }),
                                    });

                                    if (!res.ok) {
                                        throw new Error("追加に失敗しました");
                                    }

                                    // alert("子タスク追加成功！");
                                    setIsAdding(false);
                                    setNewTitle("");
                                    setNewDescription("");
                                    mutate("/api/tasks/hierarchy"); // ✅ ここで更新！
                                } catch (error) {
                                    console.error(error);
                                    alert("追加時にエラーが発生しました");
                                }
                            }}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                            追加
                        </button>
                        <button
                            onClick={() => {
                                setIsAdding(false);
                                setNewTitle("");
                                setNewDescription("");
                            }}
                            className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            )}

            {/* 子タスクの表示 */}
            {isOpen &&
                Array.isArray(task.subTasks) &&
                task.subTasks.map((sub) => <TaskTree key={sub.id} task={sub} />)}
        </div>
    );
}