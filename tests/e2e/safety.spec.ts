import { test, expect, type Page } from "@playwright/test";
import { fakeReportForMint } from "../../lib/safety/fake";

const USER = process.env.APP_USER ?? "trader@solmemebot.local";
const PASS = process.env.APP_PASSWORD ?? "dev-password";
const SECRET = process.env.HELIUS_WEBHOOK_SECRET ?? "dev-webhook-secret";

const WALLET = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
const MEME_MINT = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9A";

// Candidate memecoin mints (none are quote assets, so the parser treats buys of
// them as real buys). Pick one the deterministic fake marks risky so we can
// assert red flags are shown — we assert the displayed report matches the fake's
// contract, not reimplement the rule.
const RISKY_MINT =
  [
    MEME_MINT,
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
    "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  ].find((m) => fakeReportForMint(m).flags.some((f) => !f.passed)) ?? MEME_MINT;

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

async function ingestBuy(page: Page, mint: string, sig: string) {
  const res = await page.request.post("/api/webhooks/helius", {
    headers: { authorization: SECRET },
    data: [
      {
        signature: sig,
        timestamp: 1_750_000_000,
        tokenTransfers: [
          { fromUserAccount: "poolAcct", toUserAccount: WALLET, mint, tokenAmount: 1000 },
        ],
        nativeTransfers: [{ fromUserAccount: WALLET, toUserAccount: "poolAcct", amount: 5e8 }],
      },
    ],
  });
  expect(res.status()).toBe(200);
}

test("a signal carries a safety verdict in the feed", async ({ page }) => {
  await login(page);
  await resetToSingleWallet(page);
  await ingestBuy(page, MEME_MINT, "sigSafety1");

  await page.goto("/dashboard/feed");
  const expected = fakeReportForMint(MEME_MINT).verdict;
  await expect(page.getByTestId("safety-badge")).toHaveAttribute("data-verdict", expected);
});

test("the token page lists every check and flags the risks", async ({ page }) => {
  await login(page);
  await resetToSingleWallet(page);
  await ingestBuy(page, RISKY_MINT, "sigSafetyRisky");

  await page.goto(`/dashboard/token/${RISKY_MINT}`);

  const expected = fakeReportForMint(RISKY_MINT);
  await expect(page.getByTestId("token-verdict")).toHaveAttribute("data-verdict", expected.verdict);

  // All four checks are listed...
  await expect(page.getByTestId("safety-flag")).toHaveCount(expected.flags.length);
  // ...and at least one is a red flag (data-passed="false").
  const failed = expected.flags.filter((f) => !f.passed).length;
  expect(failed).toBeGreaterThan(0);
  await expect(page.locator('[data-testid="safety-flag"][data-passed="false"]')).toHaveCount(failed);
});
