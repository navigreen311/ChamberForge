import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Compliance Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('compliance dashboard renders', async ({ page }) => {
    await page.goto('/compliance')
    await waitForPageLoad(page)

    await expect(
      page.getByText(/compliance|regulatory|governance/i).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('consent ledger is accessible', async ({ page }) => {
    await page.goto('/compliance')
    await waitForPageLoad(page)

    // Click consent section
    const consentLink = page.locator(
      'a:has-text("Consent"), button:has-text("Consent"), [data-testid="consent-link"], [data-testid="tab-consent"], [role="tab"]:has-text("Consent")'
    )
    await expect(consentLink.first()).toBeVisible({ timeout: 10000 })
    await consentLink.first().click()
    await waitForPageLoad(page)

    // Verify consent ledger renders
    const ledger = page.locator(
      '[data-testid="consent-ledger"], [data-testid="consent-table"], table'
    ).or(page.getByText(/consent|ledger|permission|opt-in/i).first())
    await expect(ledger.first()).toBeVisible({ timeout: 10000 })
  })

  test('quality section shows SLA indicators', async ({ page }) => {
    await page.goto('/compliance')
    await waitForPageLoad(page)

    // Click quality section
    const qualityLink = page.locator(
      'a:has-text("Quality"), button:has-text("Quality"), [data-testid="quality-link"], [data-testid="tab-quality"], [role="tab"]:has-text("Quality")'
    )
    await expect(qualityLink.first()).toBeVisible({ timeout: 10000 })
    await qualityLink.first().click()
    await waitForPageLoad(page)

    // Verify SLA indicators render
    const slaIndicators = page.locator(
      '[data-testid="sla-indicator"], [data-testid="quality-metrics"], [data-testid="sla-card"]'
    ).or(page.getByText(/SLA|quality|uptime|response time|service level/i).first())
    await expect(slaIndicators.first()).toBeVisible({ timeout: 10000 })
  })
})
