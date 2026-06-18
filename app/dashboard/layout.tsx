import { signOut } from "@/auth";

const NAV_ITEMS = [
  { href: "/dashboard/wallets", label: "Tracked wallets", testid: "nav-wallets" },
  { href: "/dashboard/feed", label: "Activity feed", testid: "nav-feed" },
  { href: "/dashboard/performance", label: "Wallet performance", testid: "nav-performance" },
  { href: "/dashboard/journal", label: "Trade journal", testid: "nav-journal" },
  { href: "/dashboard/alerts", label: "Alerts", testid: "nav-alerts" },
];

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/dashboard" className="brand">
          solMemeBot
        </a>
        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-testid={item.testid}
              className="nav-link"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <form action={doSignOut} className="sidebar-signout">
          <button type="submit" className="btn-ghost">
            Sign out
          </button>
        </form>
      </aside>
      <div className="content">{children}</div>
    </div>
  );
}
