import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/config';
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Rate limiting for auth routes (Simple In-memory)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const AUTH_LIMIT = 10;
const WINDOW = 60 * 1000;
const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale
});

export default auth((req) => {
   // Rate limiting for auth-related POST requests
   if (req.nextUrl.pathname.includes('/api/auth') && req.method === 'POST') {
     const ip = (req as unknown as { ip?: string }).ip ?? "127.0.0.1";
     const now = Date.now();
     const record = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };

     if (now - record.lastReset > WINDOW) {
       record.count = 0;
       record.lastReset = now;
     }

     record.count++;
     rateLimitMap.set(ip, record);

     if (record.count > AUTH_LIMIT) {
       return new NextResponse("Too Many Requests", { status: 429 });
     }
   }

   return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/']
};
