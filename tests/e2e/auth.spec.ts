import { test, expect } from "@playwright/test";

const USER = process.env.APP_USER ?? "trader@solmemebot.local";
const PASS = process.env.APP_PASSWORD ?? "dev-password";

// Fail the test if the browser logs any console errors — the per-slice gate.
test.beforeEach(async ({ page }) => {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      throw new Error(`Console error: ${msg.text()}`);
    }
  });
});

test("unauthenticated visit to /dashboard redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "solMemeBot" })).toBeVisible();
});

test("wrong credentials show an error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(USER);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByTestId("login-error")).toBeVisible();
});

test("owner can sign in and sees their data read from Postgres", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(USER);
  await page.getByLabel("Password").fill(PASS);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  // This text is rendered from a Prisma read of the User row.
  await expect(page.getByTestId("welcome")).toHaveText(`Signed in as ${USER}`);
  await expect(page.getByTestId("member-since")).toContainText("Owner since");
});
