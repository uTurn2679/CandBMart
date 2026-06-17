import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "e-commerce-secret-key-2026-dhaka-bangladesh";

interface SessionPayload {
  userId: string;
  role: string;
  exp: number;
}

// Signs a payload into a secure HMAC-SHA256 signature token (JWT-like structure)
export function signToken(payload: Omit<SessionPayload, "exp">): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days expiration
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${signature}`;
}

// Verifies the signature of the token and checks expiration
export function verifyToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${data}`)
      .digest("base64url");
      
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8")) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    
    return payload;
  } catch (error) {
    return null;
  }
}

// Helper to retrieve the current logged-in user in Route Handlers
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;
    
    const payload = verifyToken(token);
    if (!payload) return null;
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    return user;
  } catch (error) {
    return null;
  }
}

// Helper to set session cookie
export async function setSessionCookie(userId: string, role: string) {
  const token = signToken({ userId, role });
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });
}

// Helper to clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
}

// Hash password using simple secure SHA256 hashing
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}
