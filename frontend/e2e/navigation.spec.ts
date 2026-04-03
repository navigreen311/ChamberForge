import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('sidebar shows all navigation groups', async ({ page }) => {
    await waitForPageLoad(page)

    const sidebar = page.locator('nav, [data-testid="sidebar"]')
    await expect(sidebar).toBeVisible()

    const navGroups = ['Discover', 'Qualify', 'Build', 'Sell', 'Compliance', 'Lifecycle']
    for (const group of navGroups) {
      await expect(sidebar.getByText(group, { exact: false })).toBeVisible()
    }
  })

  test('breadcrumbs show correct path', async ({ page }) => {
    await page.goto('/discover/evidence')
    await waitForPageLoad(page)

    const breadcrumbs = page.locator('[data-testid="breadcrumbs"], nav[aria-label="Breadcrumb"], .breadcrumbs')
    await expect(breadcrumbs).toBeVisible()
    await expect(breadcrumbs.getByText(/discover/i)).toBeVisible()
    await expect(breadcrumbs.getByText(/evidence/i)).toBeVisible()
  })

  test('search bar opens command palette', async ({ page }) => {
    await waitForPageLoad(page)

    const searchTrigger = page.locator(
      '[data-testid="search-bar"], [data-testid="command-palette-trigger"], button:has-text("Search")'
    )
    await searchTrigger.first().click()

    const overlay = page.locator(
      '[data-testid="command-palette"], [role="dialog"], [role="combobox"]'
    )
    await expect(overlay.first()).toBeVisible({ timeout: 5000 })
  })
})
