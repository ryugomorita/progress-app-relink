import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("🟢 authorize() が呼ばれた");

                if (!credentials?.email || !credentials?.password) {
                    console.log("🔴 入力値が不足している");
                    throw new Error("メールアドレスとパスワードを入力してください");
                }

                // 🔍 ユーザーをデータベースから検索
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    console.log("🔴 ユーザーが見つからない");
                    throw new Error("ユーザーが見つかりません");
                }

                // 🔐 パスワードを比較
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    console.log("🔴 パスワードが間違っている");
                    throw new Error("パスワードが間違っています");
                }

                console.log("✅ 認証成功", user);

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            console.log("🟢 jwt() 呼ばれた (修正後)", { token, user });

            if (user) {
                token.id = user.id;
            }

            console.log("🟢 JWTの有効期限:", token.exp, "現在時刻:", Math.floor(Date.now() / 1000));

            return token;
        },
        async session({ session, token }) {
            console.log("🟢 session() 呼ばれた (修正後) - 変更前", { session, token });

            session.user = {
                name: token.name || "",
                email: token.email || "",
                id: String(token.id) || "",
            };

            console.log("🟢 session() 呼ばれた (修正後) - 変更後", session);

            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/signin",
    },
};

// APIが正しく動いているかログを出力
console.log("🟢 NextAuth API がロードされた");

// NextAuth ハンドラー
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
