import { test, expect, type Page } from "@playwright/test";
import { fakeReportForMint } from "../../lib/safety/fake";

const USER = process.env.APP_USER ?? "trader@solmemebot.local";
const PASS = process.env.APP_PASSWORD ?? "dev-password";
const SECRET = process.env.HELIUS_WEBHOOK_SECRET ?? "dev-webhook-secret";

const WALLET = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";

const CANDIDATES = [
  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9A",
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
  "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
];
const DANGER_MINT = CANDIDATES.find((m) => fakeReportForMint(m).verdict === "danger")!;
const NORMAL_MINT = CANDIDATES.find((m) => fakeReportForMint(m).verdict !== "danger")!;

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
  expect((await res.json()).created).toBe(1);
}

test("a tracked-wallet buy of a healthy token creates a wallet_buy alert", async ({ page }) => {
  await login(page);
  await resetToSingleWallet(page);
  await ingestBuy(page, NORMAL_MINT, "sigAlertBuy");

  await page.goto("/dashboard/alerts");
  const newest = page.getByTestId("alert-row").first();
  await expect(newest).toHaveAttribute("data-type", "wallet_buy");
  await expect(newest.getByTestId("alert-type")).toHaveText("buy");
});

test("buying a danger token creates a safety_danger alert", async ({ page }) => {
  await login(page);
  await resetToSingleWallet(page);
  await ingestBuy(page, DANGER_MINT, "sigAlertDanger");

  await page.goto("/dashboard/alerts");
  const newest = page.getByTestId("alert-row").first();
  await expect(newest).toHaveAttribute("data-type", "safety_danger");
  await expect(newest.getByTestId("alert-type")).toHaveText("danger");
});
