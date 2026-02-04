import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Willkommen zurück" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Passwort")).toBeVisible();
    await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.getByRole("button", { name: "Anmelden" }).click();

    // Should show validation errors
    await expect(page.getByText("Ungültige Email-Adresse")).toBeVisible();
    await expect(page.getByText("Passwort ist erforderlich")).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Passwort").fill("password123");
    await page.getByRole("button", { name: "Anmelden" }).click();

    await expect(page.getByText("Ungültige Email-Adresse")).toBeVisible();
  });

  test("should have link to register page", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: "Jetzt registrieren" });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("should have link to forgot password page", async ({ page }) => {
    const forgotLink = page.getByRole("link", { name: "Passwort vergessen?" });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("should preserve redirect_uri in navigation", async ({ page }) => {
    const redirectUri = "https://dnd.mindforge.de/callback";
    await page.goto(`/login?redirect_uri=${encodeURIComponent(redirectUri)}`);

    const registerLink = page.getByRole("link", { name: "Jetzt registrieren" });
    await registerLink.click();

    await expect(page).toHaveURL(new RegExp(`redirect_uri=${encodeURIComponent(redirectUri)}`));
  });

  test("should have remember me checkbox", async ({ page }) => {
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toBeVisible();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });
});

test.describe("Login Page - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should be responsive on mobile", async ({ page }) => {
    await page.goto("/login");

    // Form should be full width on mobile
    const form = page.locator("form");
    await expect(form).toBeVisible();

    // Button should be full width
    const button = page.getByRole("button", { name: "Anmelden" });
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.width).toBeGreaterThan(300);
  });
});
