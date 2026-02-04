import { test, expect } from "@playwright/test";

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("should display register form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Account erstellen" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Passwort", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Passwort bestätigen")).toBeVisible();
    await expect(page.getByRole("button", { name: "Registrieren" })).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.getByRole("button", { name: "Registrieren" }).click();

    await expect(page.getByText("Ungültige Email-Adresse")).toBeVisible();
    await expect(page.getByText("Passwort muss mindestens 8 Zeichen lang sein")).toBeVisible();
  });

  test("should show error when passwords don't match", async ({ page }) => {
    await page.getByLabel("Email").fill("test@example.de");
    await page.getByLabel("Passwort", { exact: true }).fill("password123");
    await page.getByLabel("Passwort bestätigen").fill("different123");
    await page.getByRole("button", { name: "Registrieren" }).click();

    await expect(page.getByText("Passwörter stimmen nicht überein")).toBeVisible();
  });

  test("should show error for password too short", async ({ page }) => {
    await page.getByLabel("Email").fill("test@example.de");
    await page.getByLabel("Passwort", { exact: true }).fill("short");
    await page.getByLabel("Passwort bestätigen").fill("short");
    await page.getByRole("button", { name: "Registrieren" }).click();

    await expect(page.getByText("Passwort muss mindestens 8 Zeichen lang sein")).toBeVisible();
  });

  test("should have link to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: "Jetzt anmelden" });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should preserve redirect_uri in navigation", async ({ page }) => {
    const redirectUri = "https://dnd.mindforge.de/callback";
    await page.goto(`/register?redirect_uri=${encodeURIComponent(redirectUri)}`);

    const loginLink = page.getByRole("link", { name: "Jetzt anmelden" });
    await loginLink.click();

    await expect(page).toHaveURL(new RegExp(`redirect_uri=${encodeURIComponent(redirectUri)}`));
  });
});

test.describe("Register Page - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should be responsive on mobile", async ({ page }) => {
    await page.goto("/register");

    // Form should be visible and usable
    const form = page.locator("form");
    await expect(form).toBeVisible();

    // All inputs should be accessible
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Passwort", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Passwort bestätigen")).toBeVisible();
  });
});
