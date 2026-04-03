import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('command palette opens via keyboard shortcut', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // Open command palette with Cmd+K / Ctrl+K
    await page.keyboard.press('Meta+k')

    const palette = page.locator(
      '[data-testid="command-palette"], [role="dialog"], [role="combobox"], [data-testid="search-modal"]'
    )

    // Fallback to Ctrl+K if Meta+K did not open it
    if ((await palette.count()) === 0 || !(await palette.first().isVisible().catch(() => false))) {
      await page.keyboard.press('Control+k')
    }

    await expect(palette.first()).toBeVisible({ timeout: 5000 })
  })

  test('command palette opens via search button click', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // Click search trigger
    const searchTrigger = page.locator(
      '[data-testid="search-bar"], [data-testid="command-palette-trigger"], button:has-text("Search")'
    )
    await searchTrigger.first().click()

    const palette = page.locator(
      '[data-testid="command-palette"], [role="dialog"], [role="combobox"], [data-testid="search-modal"]'
    )
    await expect(palette.first()).toBeVisible({ timeout: 5000 })
  })

  test('typing in command palette shows grouped results', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // Open command palette
    await page.keyboard.press('Meta+k')
    const palette = page.locator(
      '[data-testid="command-palette"], [role="dialog"], [role="combobox"], [data-testid="search-modal"]'
    )
    if ((await palette.count()) === 0 || !(await palette.first().isVisible().catch(() => false))) {
      await page.keyboard.press('Control+k')
    }
    await expect(palette.first()).toBeVisible({ timeout: 5000 })

    // Type a search query
    const searchInput = palette.first().locator('input').or(
      page.locator('[data-testid="command-palette-input"], [data-testid="search-input"]')
    )
    await searchInput.first().fill('client')
    await waitForPageLoad(page)

    // Verify grouped results appear
    const resultGroups = palette.first().locator(
      '[data-testid="result-group"], [role="group"], .search-group'
    ).or(page.getByText(/pages|clients|actions|commands/i).first())
    await expect(resultGroups.first()).toBeVisible({ timeout: 10000 })
  })

  test('search page with facet filters', async ({ page }) => {
    await page.goto('/search')
    await waitForPageLoad(page)

    // Verify search page renders
    await expect(
      page.getByText(/search|results|find/i).first()
    ).toBeVisible({ timeout: 10000 })

    // Verify facet filters exist
    const facetFilters = page.locator(
      '[data-testid="facet-filter"], [data-testid="search-filters"], [data-testid="filter-panel"]'
    ).or(page.locator('aside, [role="complementary"]').first())
    await expect(facetFilters.first()).toBeVisible({ timeout: 10000 })

    // Click a facet filter
    const filterOption = facetFilters.first().locator(
      'input[type="checkbox"], button, [data-testid="filter-option"]'
    )
    if ((await filterOption.count()) > 0) {
      await filterOption.first().click()
      await waitForPageLoad(page)
    }

    // Verify results area is visible
    const results = page.locator(
      '[data-testid="search-results"], [data-testid="results-list"], .search-results'
    ).or(page.getByText(/result|found|showing/i).first())
    await expect(results.first()).toBeVisible({ timeout: 10000 })
  })
})
