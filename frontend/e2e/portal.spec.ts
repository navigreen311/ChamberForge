import { test, expect } from '@playwright/test'
import { waitForPageLoad } from './helpers/test-utils'

test.describe('Client Portal', () => {
  const portalToken = 'test-token'

  test('portal landing page renders', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`)
    await waitForPageLoad(page)

    // Verify portal landing content
    await expect(
      page.getByText(/portal|welcome|client/i).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('deliverables tab shows document list', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`)
    await waitForPageLoad(page)

    // Click Deliverables tab
    const deliverablesTab = page.locator(
      '[data-testid="tab-deliverables"], button:has-text("Deliverables"), [role="tab"]:has-text("Deliverables")'
    )
    await expect(deliverablesTab.first()).toBeVisible({ timeout: 10000 })
    await deliverablesTab.first().click()
    await waitForPageLoad(page)

    // Verify document list renders
    const documentList = page.locator(
      '[data-testid="document-list"], [data-testid="deliverables-list"], table, .document-list'
    ).or(page.getByText(/document|deliverable|file/i).first())
    await expect(documentList.first()).toBeVisible({ timeout: 10000 })
  })

  test('KPIs tab shows metric cards', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`)
    await waitForPageLoad(page)

    // Click KPIs tab
    const kpiTab = page.locator(
      '[data-testid="tab-kpis"], button:has-text("KPIs"), [role="tab"]:has-text("KPI")'
    )
    await expect(kpiTab.first()).toBeVisible({ timeout: 10000 })
    await kpiTab.first().click()
    await waitForPageLoad(page)

    // Verify metric cards render
    const metricCards = page.locator(
      '[data-testid="metric-card"], [data-testid="kpi-card"], .metric-card'
    ).or(page.getByText(/metric|kpi|performance|target/i).first())
    await expect(metricCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('reports tab shows report list', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`)
    await waitForPageLoad(page)

    // Click Reports tab
    const reportsTab = page.locator(
      '[data-testid="tab-reports"], button:has-text("Reports"), [role="tab"]:has-text("Reports")'
    )
    await expect(reportsTab.first()).toBeVisible({ timeout: 10000 })
    await reportsTab.first().click()
    await waitForPageLoad(page)

    // Verify report list renders
    const reportList = page.locator(
      '[data-testid="report-list"], [data-testid="reports-list"], table, .report-list'
    ).or(page.getByText(/report|analysis|summary/i).first())
    await expect(reportList.first()).toBeVisible({ timeout: 10000 })
  })
})
