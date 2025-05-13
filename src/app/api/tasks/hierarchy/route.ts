import { NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { PrismaClient, Task as PrismaTask } from "@prisma/client";

const prisma = new PrismaClient();

// 型定義
type TaskWithSubTasks = PrismaTask & {
    subTasks?: TaskWithSubTasks[];
    progress: number;
};

// ✅ 進捗率計算 (子タスクの平均進捗率)
function calculateProgress(subTasks: TaskWithSubTasks[]): number {
    if (subTasks.length === 0) {
        return 0; // 子タスクがいない場合は0%
    }

    const totalProgress = subTasks.reduce((sum, task) => {
        const taskProgress =
            task.subTasks && task.subTasks.length > 0
                ? calculateProgress(task.subTasks)
                : task.status === "done"
                    ? 100
                    : 0;
        return sum + taskProgress;
    }, 0);

    return parseFloat((totalProgress / subTasks.length).toFixed(1));
}

// ✅ 階層構造の構築
function buildTaskTree(tasks: PrismaTask[], parentId: string | null = null): TaskWithSubTasks[] {
    const children = tasks.filter((task) => task.parentId === parentId);
    return children.map((child) => {
        const subTasks = buildTaskTree(tasks, child.id);
        const progress = subTasks.length > 0 ? calculateProgress(subTasks) : child.status === "done" ? 100 : 0;
        return {
            ...child,
            subTasks,
            progress,
        };
    });
}

// ✅ JWT認証
const authenticate = (req: Request) => {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    return decoded;
};

// ✅ GET APIエンドポイント
export async function GET(req: Request) {
    const decoded = authenticate(req);
    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tasks = await prisma.task.findMany({
            where: { userId: decoded.id },
            orderBy: { createdAt: "asc" },
        });

        const tree = buildTaskTree(tasks);
        return NextResponse.json(tree);
    } catch (error) {
        console.error("階層タスク取得エラー:", error);
        return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
}