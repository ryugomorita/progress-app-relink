export type Task = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    parentId: string | null;
    progress: number;
    subTasks?: Task[];  // ✅ オプショナルに変更
};