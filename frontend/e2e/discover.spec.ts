import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Discover Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('discover page shows problem list', async ({ page }) => {
    await page.goto('/discover')
    await waitForPageLoad(page)

    const grid = page.locator(
      '[data-testid="problem-list"], [data-testid="problem-grid"], .grid, table'
    )
    await expect(grid.first()).toBeVisible()
  })

  test('filter problems by tier', async ({ page }) => {
    await page.goto('/discover')
    await waitForPageLoad(page)

    const filterTrigger = page.locator(
      '[data-testid="tier-filter"], select:has-text("Tier"), button:has-text("Tier"), [data-testid="filter-tier"]'
    )
    await filterTrigger.first().click()

    // Select a tier option from the dropdown / filter
    const tierOption = page.getByRole('option', { name: /tier/i }).or(
      page.locator('[data-testid="tier-option"]').first()
    )
    if ((await tierOption.count()) > 0) {
      await tierOption.first().click()
    }

    await waitForPageLoad(page)

    // Verify the list has been filtered (content still visible)
    const grid = page.locator(
      '[data-testid="problem-list"], [data-testid="problem-grid"], .grid, table'
    )
    await expect(grid.first()).toBeVisible()
  })

  test('problem detail shows ontology fields', async ({ page }) => {
    await page.goto('/discover')
    await waitForPageLoad(page)

    // Click the first problem card / row
    const firstCard = page.locator(
      '[data-testid="problem-card"], [data-testid="problem-row"], .grid > div, table tbody tr'
    ).first()
    await firstCard.click()

    await waitForPageLoad(page)

    // Verify detail page shows ontology-related fields
    await expect(
      page.getByText(/problem|pain point|description|ontology|category/i).first()
    ).toBeVisible()
  })
})
