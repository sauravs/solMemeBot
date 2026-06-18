import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { validateCredentials } from "@/lib/auth/validate";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const email = creds?.email as string | undefined;
        const password = creds?.password as string | undefined;
        if (
          !validateCredentials(
            email,
            password,
            process.env.APP_USER,
            process.env.APP_PASSWORD,
          )
        ) {
          return null;
        }
        // Single owner: ensure the User row exists, then return it.
        const user = await prisma.user.upsert({
          where: { email: email! },
          update: {},
          create: { email: email! },
        });
        return { id: user.id, email: user.email };
      },
    }),
  ],
});
