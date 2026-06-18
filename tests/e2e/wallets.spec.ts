import { test, expect, type Page } from "@playwright/test";

const USER = process.env.APP_USER ?? "trader@solmemebot.local";
const PASS = process.env.APP_PASSWORD ?? "dev-password";

// A couple of distinct valid Solana addresses for the tests.
const ADDR_A = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
const ADDR_B = "So11111111111111111111111111111111111111112";

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

async function removeAll(page: Page) {
  await page.goto("/dashboard/wallets");
  // Remove any wallets left over from earlier runs so tests are independent.
  // Wait for the row count to settle after each removal so we never click a
  // button that's detaching during the post-action navigation.
  let count = await page.getByTestId("wallet-row").count();
  while (count > 0) {
    await page.getByTestId("remove-wallet").first().click();
    await expect(page.getByTestId("wallet-row")).toHaveCount(count - 1);
    count -= 1;
  }
}

test.describe.configure({ mode: "serial" });

test("owner can reach the wallets page from the dashboard", async ({ page }) => {
  await login(page);
  await page.getByTestId("nav-wallets").click();
  await expect(page.getByRole("heading", { name: "Tracked wallets" })).toBeVisible();
});

test("adding a valid wallet persists across reload, and it can be removed", async ({ page }) => {
  await login(page);
  await removeAll(page);

  await page.getByLabel("Wallet address").fill(ADDR_A);
  await page.getByLabel("Label (optional)").fill("KOL whale #1");
  await page.getByRole("button", { name: "Add wallet" }).click();

  await expect(page.getByTestId("wallet-row")).toHaveCount(1);
  await expect(page.getByTestId("wallet-address")).toHaveText(ADDR_A);
  await expect(page.getByTestId("wallet-label")).toHaveText("KOL whale #1");

  // Persists across a full reload (it's in Postgres, not just the page).
  await page.reload();
  await expect(page.getByTestId("wallet-address")).toHaveText(ADDR_A);

  await page.getByTestId("remove-wallet").click();
  await expect(page.getByTestId("wallet-row")).toHaveCount(0);
  await expect(page.getByTestId("empty-state")).toBeVisible();
});

test("an invalid address is rejected with an error", async ({ page }) => {
  await login(page);
  await removeAll(page);

  await page.getByLabel("Wallet address").fill("not-a-real-address");
  await page.getByRole("button", { name: "Add wallet" }).click();

  await expect(page.getByTestId("add-error")).toBeVisible();
  await expect(page.getByTestId("wallet-row")).toHaveCount(0);
});

test("the same wallet cannot be added twice", async ({ page }) => {
  await login(page);
  await removeAll(page);

  await page.getByLabel("Wallet address").fill(ADDR_B);
  await page.getByRole("button", { name: "Add wallet" }).click();
  await expect(page.getByTestId("wallet-row")).toHaveCount(1);

  await page.getByLabel("Wallet address").fill(ADDR_B);
  await page.getByRole("button", { name: "Add wallet" }).click();
  await expect(page.getByTestId("add-error")).toHaveText(/already tracking/i);
  await expect(page.getByTestId("wallet-row")).toHaveCount(1);

  await removeAll(page);
});
