import { test, expect } from '@playwright/test'
import { loginAsAdmin, waitForPageLoad } from './helpers/test-utils'

test.describe('Settings Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('settings page shows all sections', async ({ page }) => {
    await page.goto('/settings')
    await waitForPageLoad(page)

    await expect(
      page.getByText(/settings|preferences|configuration/i).first()
    ).toBeVisible({ timeout: 10000 })

    // Verify key settings sections are listed
    const sections = ['Profile', 'Members', 'Billing', 'Notifications']
    for (const section of sections) {
      const sectionEl = page.locator(
        `a:has-text("${section}"), button:has-text("${section}"), [data-testid="settings-${section.toLowerCase()}"]`
      ).or(page.getByText(new RegExp(section, 'i')).first())
      await expect(sectionEl.first()).toBeVisible()
    }
  })

  test('profile section shows form', async ({ page }) => {
    await page.goto('/settings')
    await waitForPageLoad(page)

    // Click profile section
    const profileLink = page.locator(
      'a:has-text("Profile"), button:has-text("Profile"), [data-testid="settings-profile"]'
    )
    await profileLink.first().click()
    await waitForPageLoad(page)

    // Verify profile form fields
    const nameInput = page.locator(
      '[data-testid="profile-name"], input[name="name"], input[placeholder*="name" i]'
    )
    await expect(nameInput.first()).toBeVisible({ timeout: 10000 })

    const emailInput = page.locator(
      '[data-testid="profile-email"], input[name="email"], input[placeholder*="email" i]'
    )
    await expect(emailInput.first()).toBeVisible()

    // Verify save button exists
    const saveButton = page.locator(
      'button:has-text("Save"), button:has-text("Update"), [data-testid="save-profile"]'
    )
    await expect(saveButton.first()).toBeVisible()
  })

  test('members section shows member table', async ({ page }) => {
    await page.goto('/settings')
    await waitForPageLoad(page)

    // Click members section
    const membersLink = page.locator(
      'a:has-text("Members"), button:has-text("Members"), [data-testid="settings-members"]'
    )
    await membersLink.first().click()
    await waitForPageLoad(page)

    // Verify member table renders
    const memberTable = page.locator(
      '[data-testid="member-table"], [data-testid="members-list"], table'
    )
    await expect(memberTable.first()).toBeVisible({ timeout: 10000 })

    // Verify at least one member row exists
    const memberRows = memberTable.first().locator('tbody tr').or(
      page.locator('[data-testid="member-row"]')
    )
    await expect(memberRows.first()).toBeVisible({ timeout: 10000 })
  })
})
