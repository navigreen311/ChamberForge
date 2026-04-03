import { type Page, expect } from '@playwright/test'

/**
 * Log in as an admin user by filling the login form and submitting.
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@chamberforge.com')
  await page.getByLabel(/password/i).fill('admin123')
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  await waitForPageLoad(page)
}

/**
 * Log in as an operator user by filling the login form and submitting.
 */
export async function loginAsOperator(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('operator@chamberforge.com')
  await page.getByLabel(/password/i).fill('operator123')
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  await waitForPageLoad(page)
}

/**
 * Wait for loading skeletons / spinners to disappear, indicating the page
 * has finished its initial data fetch.
 */
export async function waitForPageLoad(page: Page) {
  // Wait for any skeleton loaders to disappear
  await page.waitForLoadState('networkidle')
  const skeletons = page.locator('[data-testid="skeleton"], .animate-pulse')
  if ((await skeletons.count()) > 0) {
    await expect(skeletons.first()).toBeHidden({ timeout: 10000 })
  }
}
