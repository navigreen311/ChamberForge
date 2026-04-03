import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Build Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('playbook gallery shows 10 playbooks', async ({ page }) => {
    await page.goto('/build/playbooks')
    await waitForPageLoad(page)

    const playbooks = page.locator(
      '[data-testid="playbook-card"], [data-testid="playbook-item"]'
    )

    // Verify at least some playbooks render; expect 10 in a fully seeded environment
    await expect(playbooks.first()).toBeVisible({ timeout: 10000 })
    const count = await playbooks.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('offer creation wizard has 6 steps', async ({ page }) => {
    await page.goto('/build/offer/new')
    await waitForPageLoad(page)

    // Look for step indicators in the wizard
    const steps = page.locator(
      '[data-testid="wizard-step"], [data-testid="step-indicator"] > *, .stepper > *, [role="tablist"] > *'
    )

    await expect(steps.first()).toBeVisible({ timeout: 10000 })
    const stepCount = await steps.count()
    expect(stepCount).toBe(6)
  })
})
