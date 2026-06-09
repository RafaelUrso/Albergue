import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const perfil = (auth?.user as { perfil?: string })?.perfil;

      const isAdminRoute = nextUrl.pathname.includes("/admin");
      const isReceptionRoute = nextUrl.pathname.includes("/reception");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        if (perfil !== "ADMIN_GERAL" && perfil !== "ADMIN_FINANCEIRO") {
          return false; // Middleware handles redirect to login or authorized returns false
        }
      }

      if (isReceptionRoute) {
        if (!isLoggedIn) return false;
        if (perfil !== "RECEPCIONISTA" && perfil !== "ADMIN_GERAL") {
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.perfil = (user as { perfil?: string }).perfil;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { perfil?: unknown }).perfil = token.perfil;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
