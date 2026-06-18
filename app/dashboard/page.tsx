import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

const SECTIONS = [
  {
    href: "/dashboard/wallets",
    title: "Tracked wallets",
    desc: "Hand-pick the smart-money wallets to follow.",
  },
  {
    href: "/dashboard/feed",
    title: "Activity feed",
    desc: "Buys by your tracked wallets, with safety verdicts.",
  },
  {
    href: "/dashboard/performance",
    title: "Wallet performance",
    desc: "Hypothetical PnL if you'd followed each wallet.",
  },
  {
    href: "/dashboard/journal",
    title: "Trade journal",
    desc: "Your real trades and net-of-fees realized PnL.",
  },
  {
    href: "/dashboard/alerts",
    title: "Alerts",
    desc: "Tracked-wallet buys and safety warnings.",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Proves the full pipeline: read the owner row back from Postgres.
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return (
    <main>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Private Solana memecoin analytics — Phase 0</p>
      </div>

      <div className="panel">
        <p data-testid="welcome">Signed in as {user?.email}</p>
        <p className="muted" data-testid="member-since">
          Owner since {user?.createdAt.toISOString()}
        </p>
      </div>

      <div className="card-grid">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card">
            <p className="card-title">{s.title}</p>
            <p className="card-desc">{s.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
