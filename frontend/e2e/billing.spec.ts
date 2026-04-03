import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Billing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('revenue dashboard renders', async ({ page }) => {
    await page.goto('/build/billing')
    await waitForPageLoad(page)

    await expect(
      page.getByText(/billing|revenue|dashboard/i).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('MRR and ARR cards display', async ({ page }) => {
    await page.goto('/build/billing')
    await waitForPageLoad(page)

    // Verify MRR card
    const mrrCard = page.locator(
      '[data-testid="mrr-card"], [data-testid="metric-mrr"]'
    ).or(page.getByText(/MRR|monthly recurring/i).first())
    await expect(mrrCard.first()).toBeVisible({ timeout: 10000 })

    // Verify ARR card
    const arrCard = page.locator(
      '[data-testid="arr-card"], [data-testid="metric-arr"]'
    ).or(page.getByText(/ARR|annual recurring/i).first())
    await expect(arrCard.first()).toBeVisible({ timeout: 10000 })
  })

  test('referrals tab is accessible', async ({ page }) => {
    await page.goto('/build/billing')
    await waitForPageLoad(page)

    // Navigate to referrals tab
    const referralsTab = page.locator(
      '[data-testid="tab-referrals"], button:has-text("Referrals"), [role="tab"]:has-text("Referral"), a:has-text("Referrals")'
    )
    await expect(referralsTab.first()).toBeVisible({ timeout: 10000 })
    await referralsTab.first().click()
    await waitForPageLoad(page)

    // Verify referrals content renders
    const referralsContent = page.locator(
      '[data-testid="referrals-list"], [data-testid="referrals-content"]'
    ).or(page.getByText(/referral|partner|affiliate/i).first())
    await expect(referralsContent.first()).toBeVisible({ timeout: 10000 })
  })
})
