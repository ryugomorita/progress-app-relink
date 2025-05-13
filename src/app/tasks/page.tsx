"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import AddParentTask from "@/components/AddParentTask";
import Modal from "@/components/Modal";
import TaskTree from "@/components/TaskTree";
import { Task } from "@/types/task";

const fetcher = (url: string, token: string) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) throw new Error("取得に失敗しました");
        return res.json();
    });

export default function TasksPage() {
    const { token } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: tasks, error, isLoading } = useSWR(
        token ? ["/api/tasks/hierarchy", token] : null,
        ([url, token]) => fetcher(url, token)
    );

    if (!token) return <p>🔴 未ログインです</p>;
    if (isLoading) return <p>読み込み中...</p>;
    if (error) return <p className="text-red-500">タスクの取得に失敗しました</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">タスク管理</h1>

            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
                ＋ 新しいタスク
            </button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <AddParentTask closeModal={() => setIsModalOpen(false)} />
            </Modal>

            {tasks.length === 0 ? (
                <p className="text-gray-400">まだタスクがありません</p>
            ) : (
                tasks.map((task: Task) => <TaskTree key={task.id} task={task} />)
            )}
        </div>
    );
}