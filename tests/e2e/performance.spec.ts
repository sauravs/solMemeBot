import { test, expect, type Page } from "@playwright/test";
import { fakePriceAt } from "../../lib/price/fake";
import { pnlPct } from "../../lib/paper-tracking/pnl";

const USER = process.env.APP_USER ?? "trader@solmemebot.local";
const PASS = process.env.APP_PASSWORD ?? "dev-password";
const WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET ?? "dev-webhook-secret";
const CRON_SECRET = process.env.CRON_SECRET ?? "dev-cron-secret";

const WALLET = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
const MEME_MINT = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9A";

const HOUR = 3_600_000;
const OBSERVED = Date.parse("2026-06-10T00:00:00Z");

function fmt(v: number | null) {
  if (v === null) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  page.on("console", (msg) => {
    if (msg.type() === "error") throw new Error(`Console error: ${msg.text()}`);
  });
});

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(USER);
  await page.getByLabel("Password").fill(PASS);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function resetToSingleWallet(page: Page) {
  await page.goto("/dashboard/wallets");
  let count = await page.getByTestId("wallet-row").count();
  while (count > 0) {
    await page.getByTestId("remove-wallet").first().click();
    await expect(page.getByTestId("wallet-row")).toHaveCount(count - 1);
    count -= 1;
  }
  await page.getByLabel("Wallet address").fill(WALLET);
  await page.getByRole("button", { name: "Add wallet" }).click();
  await expect(page.getByTestId("wallet-row")).toHaveCount(1);
}

test("rejects the cron without the bearer secret", async ({ page }) => {
  const res = await page.request.get("/api/cron/snapshots");
  expect(res.status()).toBe(401);
});

test("snapshots forward prices and shows per-wallet hypothetical PnL", async ({ page }) => {
  await login(page);
  await resetToSingleWallet(page);

  // Ingest a buy at a controlled observed time (entry price = fakePriceAt(mint, OBSERVED)).
  const ingest = await page.request.post("/api/webhooks/helius", {
    headers: { authorization: WEBHOOK_SECRET },
    data: [
      {
        signature: "sigPerf1",
        timestamp: OBSERVED / 1000,
        tokenTransfers: [
          { fromUserAccount: "poolAcct", toUserAccount: WALLET, mint: MEME_MINT, tokenAmount: 1000 },
        ],
        nativeTransfers: [{ fromUserAccount: WALLET, toUserAccount: "poolAcct", amount: 5e8 }],
      },
    ],
  });
  expect(ingest.status()).toBe(200);

  // Simulate "25h later": the 1h and 24h horizons are due, 7d is not.
  const simulatedNow = new Date(OBSERVED + 25 * HOUR).toISOString();
  const cron = await page.request.get(`/api/cron/snapshots?now=${simulatedNow}`, {
    headers: { authorization: `Bearer ${CRON_SECRET}` },
  });
  expect(cron.status()).toBe(200);
  expect((await cron.json()).created).toBe(2);

  // Expected PnL computed from the same deterministic fake.
  const entry = fakePriceAt(MEME_MINT, OBSERVED);
  const exp1h = pnlPct(entry, fakePriceAt(MEME_MINT, OBSERVED + HOUR));
  const exp24h = pnlPct(entry, fakePriceAt(MEME_MINT, OBSERVED + 24 * HOUR));

  await page.goto("/dashboard/performance");
  const row = page.getByTestId("performance-row").filter({ hasText: "Dez" });
  await expect(row.getByTestId("pnl-1h")).toHaveText(fmt(exp1h));
  await expect(row.getByTestId("pnl-24h")).toHaveText(fmt(exp24h));
  await expect(row.getByTestId("pnl-7d")).toHaveText("—");

  // The cron is idempotent — re-running creates no new snapshots at the same now.
  const cron2 = await page.request.get(`/api/cron/snapshots?now=${simulatedNow}`, {
    headers: { authorization: `Bearer ${CRON_SECRET}` },
  });
  expect((await cron2.json()).created).toBe(0);

  await resetToSingleWallet(page);
});
