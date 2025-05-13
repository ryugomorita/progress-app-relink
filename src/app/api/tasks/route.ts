import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyJwt } from "@/utils/jwt";

const prisma = new PrismaClient();

// JWTトークンの検証とユーザーIDの取得
const authenticate = (req: Request) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJwt(token);

    return decoded;
};

export async function GET(req: Request) {
    const decoded = authenticate(req);
    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
        where: { userId: decoded.id },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(tasks);
}

export async function POST(req: Request) {
    const decoded = authenticate(req);
    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        if (!body || !body.title) {
            return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
        }

        const newTask = await prisma.task.create({
            data: {
                title: body.title,
                description: body.description || "",
                userId: decoded.id,
                parentId: body.parentId || null,  // ✅ ここ追加！！
            },
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error("タスク作成エラー:", error);
        return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
}