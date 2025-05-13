import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyJwt } from "@/utils/jwt";

const prisma = new PrismaClient();

const authenticate = (req: Request) => {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    return decoded;
};

export async function PUT(req: Request) {
    const decoded = authenticate(req);
    if (!decoded?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const taskId = url.pathname.split("/").pop(); // ← `/api/tasks/[id]` から ID 抽出
    const body = await req.json();
    const { title, description, status } = body;

    const task = await prisma.task.findUnique({ where: { id: taskId! } });
    if (!task) {
        return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    if (task.userId !== decoded.id) {
        return NextResponse.json({ error: "このタスクを編集する権限がありません" }, { status: 403 });
    }

    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskId! },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(status && { status }),
            },
        });

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error("タスク更新エラー:", error);
        return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const decoded = authenticate(req);
    if (!decoded?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const taskId = url.pathname.split("/").pop();

    const task = await prisma.task.findUnique({ where: { id: taskId! } });
    if (!task) {
        return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    if (task.userId !== decoded.id) {
        return NextResponse.json({ error: "このタスクを削除する権限がありません" }, { status: 403 });
    }

    try {
        await prisma.task.delete({ where: { id: taskId! } });
        return NextResponse.json({ message: "削除完了" }, { status: 200 });
    } catch (error) {
        console.error("タスク削除エラー:", error);
        return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
}