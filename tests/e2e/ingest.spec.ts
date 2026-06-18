import { test, expect, type Page } from "@playwright/test";

const USER = process.env.APP_USER ?? "trader@solmemebot.local";
const PASS = process.env.APP_PASSWORD ?? "dev-password";
const SECRET = process.env.HELIUS_WEBHOOK_SECRET ?? "dev-webhook-secret";

const WALLET = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
const UNTRACKED = "So11111111111111111111111111111111111111112";
const MEME_MINT = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9A";

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

async function removeAllWallets(page: Page) {
  // Removing a wallet cascade-deletes its signals, so this also clears the feed.
  await page.goto("/dashboard/wallets");
  let count = await page.getByTestId("wallet-row").count();
  while (count > 0) {
    await page.getByTestId("remove-wallet").first().click();
    await expect(page.getByTestId("wallet-row")).toHaveCount(count - 1);
    count -= 1;
  }
}

async function addWallet(page: Page, address: string) {
  await page.goto("/dashboard/wallets");
  await page.getByLabel("Wallet address").fill(address);
  await page.getByRole("button", { name: "Add wallet" }).click();
  await expect(page.getByTestId("wallet-row")).toHaveCount(1);
}

function buyPayload(wallet: string, mint: string, sig: string) {
  return [
    {
      signature: sig,
      timestamp: 1_750_000_000,
      tokenTransfers: [
        { fromUserAccount: "poolAcct", toUserAccount: wallet, mint, tokenAmount: 1000 },
      ],
      nativeTransfers: [{ fromUserAccount: wallet, toUserAccount: "poolAcct", amount: 500_000_000 }],
    },
  ];
}

test("rejects a webhook with a missing or wrong secret", async ({ page }) => {
  const res = await page.request.post("/api/webhooks/helius", {
    headers: { authorization: "wrong-secret" },
    data: buyPayload(WALLET, MEME_MINT, "sigBad"),
  });
  expect(res.status()).toBe(401);
});

test("a tracked wallet's buy appears in the activity feed", async ({ page }) => {
  await login(page);
  await removeAllWallets(page);
  await addWallet(page, WALLET);

  const res = await page.request.post("/api/webhooks/helius", {
    headers: { authorization: SECRET },
    data: buyPayload(WALLET, MEME_MINT, "sigFeed1"),
  });
  expect(res.status()).toBe(200);
  expect((await res.json()).created).toBe(1);

  await page.goto("/dashboard/feed");
  await expect(page.getByTestId("signal-row")).toHaveCount(1);
  await expect(page.getByTestId("signal-token")).toContainText(MEME_MINT.slice(0, 4));
});

test("ignores buys from wallets that are not tracked", async ({ page }) => {
  await login(page);
  await removeAllWallets(page);
  await addWallet(page, WALLET);

  const res = await page.request.post("/api/webhooks/helius", {
    headers: { authorization: SECRET },
    data: buyPayload(UNTRACKED, MEME_MINT, "sigUntracked"),
  });
  expect(res.status()).toBe(200);
  expect((await res.json()).created).toBe(0);

  await page.goto("/dashboard/feed");
  await expect(page.getByTestId("feed-empty")).toBeVisible();
});

test("is idempotent when the same webhook is replayed", async ({ page }) => {
  await login(page);
  await removeAllWallets(page);
  await addWallet(page, WALLET);

  const payload = buyPayload(WALLET, MEME_MINT, "sigReplay");
  const first = await page.request.post("/api/webhooks/helius", {
    headers: { authorization: SECRET },
    data: payload,
  });
  expect((await first.json()).created).toBe(1);

  const second = await page.request.post("/api/webhooks/helius", {
    headers: { authorization: SECRET },
    data: payload,
  });
  expect((await second.json()).created).toBe(0);

  await page.goto("/dashboard/feed");
  await expect(page.getByTestId("signal-row")).toHaveCount(1);

  await removeAllWallets(page);
});
