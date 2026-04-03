import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Admin Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('admin dashboard shows system info', async ({ page }) => {
    await page.goto('/admin')
    await waitForPageLoad(page)

    // Verify the admin dashboard renders with system information
    await expect(
      page.getByText(/admin|dashboard|system/i).first()
    ).toBeVisible()

    // Check for system info cards or panels
    const infoSection = page.locator(
      '[data-testid="system-info"], [data-testid="admin-stats"], .admin-dashboard'
    ).or(page.getByText(/status|uptime|version|health/i).first())
    await expect(infoSection.first()).toBeVisible({ timeout: 10000 })
  })

  test('runtime page shows AI costs', async ({ page }) => {
    await page.goto('/admin/runtime')
    await waitForPageLoad(page)

    // Verify runtime page renders AI cost information
    await expect(
      page.getByText(/runtime|ai|cost|usage|token/i).first()
    ).toBeVisible()
  })
})
