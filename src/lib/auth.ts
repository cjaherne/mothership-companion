/**
 * Auth utilities - Edge-compatible (Web Crypto API).
 * Used by middleware and API routes.
 */

import { NextResponse } from "next/server";

const COOKIE_NAME = "mothership_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function getSigningKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters (64 hex chars recommended)");
  }
  let keyBytes: Uint8Array;
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    keyBytes = new Uint8Array(secret.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  } else {
    const encoded = new TextEncoder().encode(secret);
    const hash = await crypto.subtle.digest("SHA-256", encoded);
    keyBytes = new Uint8Array(hash);
  }
  const buffer = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength
  ) as ArrayBuffer;
  return crypto.subtle.importKey(
    "raw",
    buffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);
  return new Uint8Array(atob(str).split("").map((c) => c.charCodeAt(0)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function timingSafeCompare(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const hashA = await crypto.subtle.digest("SHA-256", enc.encode(a));
  const hashB = await crypto.subtle.digest("SHA-256", enc.encode(b));
  return timingSafeEqual(new Uint8Array(hashA), new Uint8Array(hashB));
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) return false;
  const userOk = await timingSafeCompare(username, expectedUser);
  const passOk = await timingSafeCompare(password, expectedPass);
  return userOk && passOk;
}

export async function createSessionCookie(): Promise<string> {
  const payload = {
    user: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  const sigB64 = base64UrlEncode(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

export async function getSessionFromToken(token: string): Promise<{ user: string } | null> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;
    const key = await getSigningKey();
    const sigBytes = base64UrlDecode(sigB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64))
    ) as { user?: string; exp?: number };
    if (!payload.user || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { user: payload.user };
  } catch {
    return null;
  }
}

export async function setAuthCookie(response: NextResponse, token: string): Promise<void> {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie(response: NextResponse): Promise<void> {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export function getAuthCookie(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match?.[1];
}
