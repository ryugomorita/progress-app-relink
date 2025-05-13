import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string; // ✅ ユーザー ID を追加
            name: string;
            email: string;
        };
    }
    interface User {
        id: string; // ✅ `user.id` の型を明示
        name: string;
        email: string;
    }
}
