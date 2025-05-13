import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// JWTを発行する関数
export const signJwt = (payload: object) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
};

// JWTを検証する関数
export const verifyJwt = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return typeof decoded === "string" ? null : decoded; // 🔥 ここを修正
    } catch (error) {
        console.error("JWT 検証エラー:", error);
        return null;
    }
};