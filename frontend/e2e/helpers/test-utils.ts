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

/**
 * Register a new test user and return the credentials used.
 */
export async function setupTestUser(page: Page, overrides?: { name?: string; email?: string; password?: string }) {
  const name = overrides?.name ?? `Test User ${Date.now()}`
  const email = overrides?.email ?? `test-${Date.now()}@chamberforge.com`
  const password = overrides?.password ?? 'TestPass123!'

  await page.goto('/register')
  await page.getByLabel(/name|full name/i).fill(name)
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /register|sign up|create account/i }).click()
  await waitForPageLoad(page)

  return { name, email, password }
}

/**
 * Create a test problem via the Discover AI scan flow.
 * Assumes the user is already logged in.
 */
export async function createTestProblem(page: Page) {
  await page.goto('/discover')
  await waitForPageLoad(page)

  const scanButton = page.locator(
    '[data-testid="ai-scan-button"], button:has-text("Scan"), button:has-text("Run AI"), button:has-text("Discover")'
  )
  if ((await scanButton.count()) > 0) {
    await scanButton.first().click()
    await waitForPageLoad(page)
  }

  // Wait for at least one problem card to appear
  const problemCard = page.locator(
    '[data-testid="problem-card"], [data-testid="problem-row"], .grid > div, table tbody tr'
  )
  await expect(problemCard.first()).toBeVisible({ timeout: 15000 })
}

/**
 * Create a test offer via the Build offer wizard.
 * Assumes the user is already logged in.
 */
export async function createTestOffer(page: Page, offerName?: string) {
  const name = offerName ?? `Test Offer ${Date.now()}`

  await page.goto('/build/offer/new')
  await waitForPageLoad(page)

  // Fill the first step with the offer name
  const nameInput = page.locator(
    '[data-testid="offer-name"], input[name="name"], input[placeholder*="name" i]'
  )
  if ((await nameInput.count()) > 0) {
    await nameInput.first().fill(name)
  }

  // Advance through wizard steps using the Next / Continue button
  const nextButton = page.locator(
    'button:has-text("Next"), button:has-text("Continue"), [data-testid="wizard-next"]'
  )
  const steps = 5 // advance through remaining steps
  for (let i = 0; i < steps; i++) {
    if ((await nextButton.count()) > 0 && (await nextButton.first().isEnabled())) {
      await nextButton.first().click()
      await waitForPageLoad(page)
    }
  }

  // Submit the final step
  const submitButton = page.locator(
    'button:has-text("Create"), button:has-text("Submit"), button:has-text("Finish"), [data-testid="wizard-submit"]'
  )
  if ((await submitButton.count()) > 0) {
    await submitButton.first().click()
    await waitForPageLoad(page)
  }

  return { name }
}
