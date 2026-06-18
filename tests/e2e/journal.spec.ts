import { test, expect, type Page } from "@playwright/test";

const USER = process.env.APP_USER ?? "trader@solmemebot.local";
const PASS = process.env.APP_PASSWORD ?? "dev-password";

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

async function clearJournal(page: Page) {
  await page.goto("/dashboard/journal");
  let count = await page.getByTestId("journal-row").count();
  while (count > 0) {
    await page.getByTestId("remove-trade").first().click();
    await expect(page.getByTestId("journal-row")).toHaveCount(count - 1);
    count -= 1;
  }
}

async function logTrade(
  page: Page,
  t: { token: string; quantity: string; entry: string; exit?: string; fees?: string },
) {
  await page.getByLabel("Token (mint or symbol)").fill(t.token);
  await page.getByLabel("Quantity (tokens)").fill(t.quantity);
  await page.getByLabel("Entry price (USD)").fill(t.entry);
  if (t.exit !== undefined) await page.getByLabel(/Exit price/).fill(t.exit);
  await page.getByLabel("Fees (USD)").fill(t.fees ?? "0");
  await page.getByRole("button", { name: "Log trade" }).click();
  // Wait for the post-submit reload to settle (the form resets) before continuing.
  await expect(page.getByLabel("Token (mint or symbol)")).toHaveValue("");
}

test("logs a closed trade and shows its net-of-fees PnL and totals", async ({ page }) => {
  await login(page);
  await clearJournal(page);

  // 100 tokens 1.00 -> 2.00, $5 fees => +$95.00
  await logTrade(page, { token: "BONK", quantity: "100", entry: "1", exit: "2", fees: "5" });

  await expect(page.getByTestId("journal-row")).toHaveCount(1);
  await expect(page.getByTestId("journal-pnl")).toHaveText("+$95.00");
  await expect(page.getByTestId("journal-total")).toContainText("+$95.00");
  await expect(page.getByTestId("journal-total")).toContainText("1 closed / 1 logged");
});

test("an open trade (no exit) is excluded from realized totals", async ({ page }) => {
  await login(page);
  await clearJournal(page);

  await logTrade(page, { token: "WIF", quantity: "10", entry: "2" }); // open

  await expect(page.getByTestId("journal-pnl")).toHaveText("—");
  await expect(page.getByTestId("journal-total")).toContainText("+$0.00");
  await expect(page.getByTestId("journal-total")).toContainText("0 closed / 1 logged");
});

test("totals sum across multiple trades", async ({ page }) => {
  await login(page);
  await clearJournal(page);

  await logTrade(page, { token: "AAA", quantity: "100", entry: "1", exit: "2", fees: "5" }); // +95
  await logTrade(page, { token: "BBB", quantity: "50", entry: "2", exit: "1", fees: "3" }); // -53

  await expect(page.getByTestId("journal-row")).toHaveCount(2);
  await expect(page.getByTestId("journal-total")).toContainText("+$42.00");

  await clearJournal(page);
});

test("rejects an invalid trade (non-positive quantity)", async ({ page }) => {
  await login(page);
  await clearJournal(page);

  // Bypass the browser number input min by going through the form value directly.
  await page.getByLabel("Token (mint or symbol)").fill("CCC");
  await page.getByLabel("Quantity (tokens)").fill("0");
  await page.getByLabel("Entry price (USD)").fill("1");
  await page.getByRole("button", { name: "Log trade" }).click();

  await expect(page.getByTestId("journal-error")).toBeVisible();
  await expect(page.getByTestId("journal-row")).toHaveCount(0);
});
