import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Proves the full pipeline: read the owner row back from Postgres.
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return (
    <main>
      <h1>solMemeBot</h1>
      <p className="muted">Private analytics dashboard — Phase 0</p>

      <div className="panel">
        <p data-testid="welcome">Signed in as {user?.email}</p>
        <p className="muted" data-testid="member-since">
          Owner since {user?.createdAt.toISOString()}
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
