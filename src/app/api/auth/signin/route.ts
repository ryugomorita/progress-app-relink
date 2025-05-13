import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { signJwt } from "@/utils/jwt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "メールアドレスとパスワードを入力してください" },
                { status: 400 }
            );
        }

        // 🔹 ユーザーを検索
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 401 }
            );
        }

        // 🔹 パスワードを検証
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "パスワードが正しくありません" },
                { status: 401 }
            );
        }

        // 🔹 JWTトークン発行
        const token = signJwt({ id: user.id, email: user.email });

        // 🔥 クライアントにトークンを返す
        return NextResponse.json(
            { message: "ログイン成功", token, user },
            { status: 200 }
        );
    } catch (error) {
        console.error("⚠️ ログインエラー:", error);
        return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
}