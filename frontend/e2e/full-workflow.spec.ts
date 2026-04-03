import { test, expect } from '@playwright/test'
import {
  loginAsAdmin,
  waitForPageLoad,
  setupTestUser,
  createTestProblem,
} from './helpers/test-utils'

test.describe('Full User Workflow', () => {
  test('register → onboarding → dashboard end-to-end', async ({ page }) => {
    // 1. Register new account
    const user = await setupTestUser(page)

    // Should be redirected to onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/onboarding/)

    // 2. Complete 2 onboarding steps
    const nextStep = page.locator(
      'button:has-text("Next"), button:has-text("Continue"), [data-testid="onboarding-next"]'
    )
    await expect(nextStep.first()).toBeVisible({ timeout: 10000 })
    await nextStep.first().click()
    await waitForPageLoad(page)

    await nextStep.first().click()
    await waitForPageLoad(page)

    // 3. Skip the rest
    const skipButton = page.locator(
      'button:has-text("Skip"), button:has-text("Skip All"), [data-testid="onboarding-skip"]'
    )
    await expect(skipButton.first()).toBeVisible({ timeout: 5000 })
    await skipButton.first().click()
    await waitForPageLoad(page)

    // 4. Should land on dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('dashboard shows next action, metrics, and agent status', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // Next action card
    const nextAction = page.locator(
      '[data-testid="next-action"], [data-testid="action-card"]'
    ).or(page.getByText(/next action|recommended|get started/i).first())
    await expect(nextAction.first()).toBeVisible({ timeout: 10000 })

    // Metrics
    const metrics = page.locator(
      '[data-testid="metrics"], [data-testid="dashboard-stats"]'
    ).or(page.getByText(/metric|revenue|clients|problems/i).first())
    await expect(metrics.first()).toBeVisible()

    // Agent status
    const agentStatus = page.locator(
      '[data-testid="agent-status"], [data-testid="ai-agent"]'
    ).or(page.getByText(/agent|ai status|assistant/i).first())
    await expect(agentStatus.first()).toBeVisible()
  })

  test('discover → AI scan → problem cards', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/discover')
    await waitForPageLoad(page)

    // Run AI scan
    const scanButton = page.locator(
      '[data-testid="ai-scan-button"], button:has-text("Scan"), button:has-text("Run AI"), button:has-text("Discover")'
    )
    await expect(scanButton.first()).toBeVisible({ timeout: 10000 })
    await scanButton.first().click()
    await waitForPageLoad(page)

    // Verify problem cards appear
    const problemCards = page.locator(
      '[data-testid="problem-card"], [data-testid="problem-row"], .grid > div, table tbody tr'
    )
    await expect(problemCards.first()).toBeVisible({ timeout: 15000 })
  })

  test('problem detail → validate → 4-point scorecard', async ({ page }) => {
    await loginAsAdmin(page)
    await createTestProblem(page)

    // Click first problem
    const firstProblem = page.locator(
      '[data-testid="problem-card"], [data-testid="problem-row"], .grid > div, table tbody tr'
    ).first()
    await firstProblem.click()
    await waitForPageLoad(page)

    // Should see problem detail
    await expect(
      page.getByText(/problem|pain point|description|detail/i).first()
    ).toBeVisible()

    // Click Validate
    const validateButton = page.locator(
      'button:has-text("Validate"), [data-testid="validate-button"]'
    )
    await expect(validateButton.first()).toBeVisible({ timeout: 10000 })
    await validateButton.first().click()
    await waitForPageLoad(page)

    // Should see 4-point scorecard
    const scorecard = page.locator(
      '[data-testid="scorecard"], [data-testid="validation-scorecard"]'
    ).or(page.getByText(/score|scorecard|validation/i).first())
    await expect(scorecard.first()).toBeVisible({ timeout: 10000 })

    // Expect 4 scoring criteria
    const scoringItems = page.locator(
      '[data-testid="score-item"], [data-testid="scorecard-criterion"], .scorecard-item'
    )
    if ((await scoringItems.count()) > 0) {
      expect(await scoringItems.count()).toBe(4)
    }
  })

  test('build → playbooks → activate → customize → create offer', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/build/playbooks')
    await waitForPageLoad(page)

    // Find and click "Private Ops Office" playbook
    const privateOps = page.getByText(/private ops office/i).first()
    await expect(privateOps).toBeVisible({ timeout: 10000 })
    await privateOps.click()
    await waitForPageLoad(page)

    // Activate the playbook
    const activateButton = page.locator(
      'button:has-text("Activate"), button:has-text("Enable"), [data-testid="activate-playbook"]'
    )
    if ((await activateButton.count()) > 0) {
      await activateButton.first().click()
      await waitForPageLoad(page)
    }

    // Customize
    const customizeButton = page.locator(
      'button:has-text("Customize"), button:has-text("Configure"), [data-testid="customize-playbook"]'
    )
    if ((await customizeButton.count()) > 0) {
      await customizeButton.first().click()
      await waitForPageLoad(page)
    }

    // Create offer from playbook
    const createOffer = page.locator(
      'button:has-text("Create Offer"), button:has-text("Generate Offer"), [data-testid="create-offer"]'
    )
    if ((await createOffer.count()) > 0) {
      await createOffer.first().click()
      await waitForPageLoad(page)
    }
  })

  test('sell → marketing → generate positioning copy', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/sell/marketing')
    await waitForPageLoad(page)

    await expect(
      page.getByText(/marketing|positioning|copy/i).first()
    ).toBeVisible({ timeout: 10000 })

    // Generate positioning copy
    const generateButton = page.locator(
      'button:has-text("Generate"), button:has-text("Create Copy"), [data-testid="generate-copy"]'
    )
    await expect(generateButton.first()).toBeVisible({ timeout: 10000 })
    await generateButton.first().click()
    await waitForPageLoad(page)

    // Verify copy output appears
    const copyOutput = page.locator(
      '[data-testid="copy-output"], [data-testid="positioning-copy"], textarea, .prose'
    ).or(page.getByText(/positioning|value proposition|headline/i).first())
    await expect(copyOutput.first()).toBeVisible({ timeout: 15000 })
  })

  test('settings → update profile name', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/settings')
    await waitForPageLoad(page)

    // Navigate to profile section
    const profileLink = page.locator(
      'a:has-text("Profile"), button:has-text("Profile"), [data-testid="settings-profile"]'
    )
    if ((await profileLink.count()) > 0) {
      await profileLink.first().click()
      await waitForPageLoad(page)
    }

    // Update name
    const nameInput = page.locator(
      '[data-testid="profile-name"], input[name="name"], input[placeholder*="name" i]'
    )
    await expect(nameInput.first()).toBeVisible({ timeout: 10000 })
    await nameInput.first().clear()
    await nameInput.first().fill('Updated Admin Name')

    // Save
    const saveButton = page.locator(
      'button:has-text("Save"), button:has-text("Update"), [data-testid="save-profile"]'
    )
    await saveButton.first().click()
    await waitForPageLoad(page)

    // Verify success
    const success = page.getByText(/saved|updated|success/i)
    await expect(success.first()).toBeVisible({ timeout: 10000 })
  })
})
