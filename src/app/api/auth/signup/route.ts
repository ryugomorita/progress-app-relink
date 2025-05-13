import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "すべてのフィールドを入力してください" }, { status: 400 });
        }

        // 既存のユーザーがいるかチェック
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 400 });
        }

        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);

        // ユーザー作成
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("⚠️ ユーザー登録エラー:", error);
        return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
}