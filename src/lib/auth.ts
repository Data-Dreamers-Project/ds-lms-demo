import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { env } from "./env";

// Check if the email is from the university
const checkDomain = (email: string) => {
  const arrowDomains = ["@planet.kanazawa-it.ac.jp", "@st.kanazawa-it.ac.jp"];
  const arrowEmails = env.ARROW_EMAILS.split(",");
  if (arrowEmails.includes(email)) {
    return true;
  }
  return arrowDomains.some((domain) => email.endsWith(domain));
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      tenantId: env.AZURE_AD_TENANT_ID,
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.id = user.id;
        token.role = user.role;
        token.picture = user.image;
        token.displayName = user.displayName || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.displayName = token.displayName;
        session.user.image = token.picture;
      }
      return session;
    },
    async signIn({ profile, user, account }) {
      const email = profile?.email ?? profile?.emails?.[0];
      if (!email || !checkDomain(email as string)) return false;
      if (profile && account?.provider === "azure-ad") {
        // Entra ID の場合のみ名前と表示名の処理
        const { given_name, family_name } = profile;
        user.name = given_name && family_name ? `${family_name} ${given_name}` : profile.name;
        user.displayName = profile?.name ?? "";
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: "/auth/signout",
    // error: "/auth/error",
    // newUser: '/auth/new-user',
  },
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
