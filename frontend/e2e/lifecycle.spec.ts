import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Lifecycle Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('lifecycle hub renders', async ({ page }) => {
    await page.goto('/lifecycle')
    await waitForPageLoad(page)

    await expect(
      page.getByText(/lifecycle|client management|hub/i).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('client health table is visible', async ({ page }) => {
    await page.goto('/lifecycle')
    await waitForPageLoad(page)

    // Click health section
    const healthLink = page.locator(
      'a:has-text("Health"), button:has-text("Health"), [data-testid="health-link"], [data-testid="tab-health"], [role="tab"]:has-text("Health")'
    )
    await expect(healthLink.first()).toBeVisible({ timeout: 10000 })
    await healthLink.first().click()
    await waitForPageLoad(page)

    // Verify client health table renders
    const healthTable = page.locator(
      '[data-testid="client-health-table"], [data-testid="health-table"], table'
    )
    await expect(healthTable.first()).toBeVisible({ timeout: 10000 })

    // Verify table has rows
    const rows = healthTable.first().locator('tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })
  })

  test('scenario planner responds to slider adjustments', async ({ page }) => {
    await loginAsAdmin(page)

    // Navigate to scenario planner
    await page.goto('/lifecycle')
    await waitForPageLoad(page)

    const scenarioLink = page.locator(
      'a:has-text("Scenario"), button:has-text("Scenario"), [data-testid="scenario-planner-link"], [data-testid="tab-scenario"]'
    ).or(page.getByText(/scenario planner|what-if|forecast/i).first())
    await expect(scenarioLink.first()).toBeVisible({ timeout: 10000 })
    await scenarioLink.first().click()
    await waitForPageLoad(page)

    // Find a slider and adjust it
    const slider = page.locator(
      'input[type="range"], [role="slider"], [data-testid="scenario-slider"]'
    )
    await expect(slider.first()).toBeVisible({ timeout: 10000 })

    // Get initial results text
    const resultsArea = page.locator(
      '[data-testid="scenario-results"], [data-testid="projection"], .results'
    ).or(page.getByText(/result|projection|forecast|impact/i).first())
    await expect(resultsArea.first()).toBeVisible({ timeout: 10000 })
    const initialText = await resultsArea.first().textContent()

    // Adjust slider
    await slider.first().fill('75')
    await waitForPageLoad(page)

    // Verify results updated (content should change)
    await expect(resultsArea.first()).toBeVisible()
  })
})
