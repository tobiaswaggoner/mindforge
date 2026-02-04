import { test, expect } from "@playwright/test";

test.describe("Forgot Password Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
  });

  test("should display forgot password form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Passwort vergessen?" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Link senden" })).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    await page.getByRole("button", { name: "Link senden" }).click();

    await expect(page.getByText("Ungültige Email-Adresse")).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByRole("button", { name: "Link senden" }).click();

    await expect(page.getByText("Ungültige Email-Adresse")).toBeVisible();
  });

  test("should have link back to login", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: "Zurück zur Anmeldung" });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Reset Password Page", () => {
  test("should show error for missing token", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByRole("heading", { name: "Ungültiger Link" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Neuen Link anfordern" })).toBeVisible();
  });

  test("should display reset form with token", async ({ page }) => {
    await page.goto("/reset-password?token=test-token");

    await expect(page.getByRole("heading", { name: "Neues Passwort setzen" })).toBeVisible();
    await expect(page.getByLabel("Neues Passwort")).toBeVisible();
    await expect(page.getByLabel("Passwort bestätigen")).toBeVisible();
    await expect(page.getByRole("button", { name: "Passwort ändern" })).toBeVisible();
  });

  test("should validate password fields", async ({ page }) => {
    await page.goto("/reset-password?token=test-token");

    await page.getByRole("button", { name: "Passwort ändern" }).click();

    await expect(page.getByText("Passwort muss mindestens 8 Zeichen lang sein")).toBeVisible();
  });

  test("should show error when passwords don't match", async ({ page }) => {
    await page.goto("/reset-password?token=test-token");

    await page.getByLabel("Neues Passwort").fill("password123");
    await page.getByLabel("Passwort bestätigen").fill("different123");
    await page.getByRole("button", { name: "Passwort ändern" }).click();

    await expect(page.getByText("Passwörter stimmen nicht überein")).toBeVisible();
  });
});
