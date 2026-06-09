import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/config';

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale
});

export default auth((req) => {
   return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
