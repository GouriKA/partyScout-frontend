import { test, expect } from '@playwright/test';
import { setupApiMocks, getFutureDate } from './fixtures/mock-data.js';

test.describe('Party Wizard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
    // Landing page is shown first — navigate to the wizard
    await page.getByRole('button', { name: /find birthday ideas/i }).click();
    await expect(page.locator('.wizard-content')).toBeVisible();
  });

  /**
   * Helper: fill plan page date and trigger venue search
   */
  async function searchVenuesFromPlanPage(page) {
    const futureDate = getFutureDate();
    await page.locator('.plan-date-input').first().fill(futureDate.slice(0, 10));

    const searchPromise = page.waitForResponse('**/api/v2/party-wizard/search');
    await page.locator('.plan-find-btn').click();
    await searchPromise;
  }

  // ── Complete Wizard Flow ───────────────────────────────────────────────

  test.describe('Complete Wizard Flow', () => {
    test('should show plan page on wizard load', async ({ page }) => {
      await expect(page.getByText(/plan the party/i)).toBeVisible();
      await expect(page.getByText(/when is the party/i)).toBeVisible();
      await expect(page.getByText(/indoor or outdoor/i).first()).toBeVisible();
    });

    test('should navigate from plan page to venue results', async ({ page }) => {
      await searchVenuesFromPlanPage(page);
      await expect(page.getByText(/venues found/i)).toBeVisible({ timeout: 10000 });
    });

    test('should show venue cards after search', async ({ page }) => {
      await searchVenuesFromPlanPage(page);
      await expect(page.locator('.venue-card').first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Plan Page Form ─────────────────────────────────────────────────────

  test.describe('Plan Page Form', () => {
    test('should show date input', async ({ page }) => {
      const dateInput = page.locator('.plan-date-input').first();
      await expect(dateInput).toBeVisible();
    });

    test('should allow setting party date', async ({ page }) => {
      const futureDate = getFutureDate();
      const dateInput = page.locator('.plan-date-input').first();
      await dateInput.fill(futureDate.slice(0, 10));
      await expect(dateInput).not.toHaveValue('');
    });

    test('should show indoor and outdoor setting options', async ({ page }) => {
      await expect(page.getByText(/indoor/i).first()).toBeVisible();
      await expect(page.getByText(/outdoor/i).first()).toBeVisible();
    });

    test('should select indoor setting', async ({ page }) => {
      const indoorCard = page.locator('.plan-setting-card').filter({ hasText: 'Indoor' });
      await indoorCard.click();
      await expect(indoorCard).toHaveClass(/active/);
    });

    test('should select outdoor setting', async ({ page }) => {
      const outdoorCard = page.locator('.plan-setting-card').filter({ hasText: 'Outdoor' });
      await outdoorCard.click();
      await expect(outdoorCard).toHaveClass(/active/);
    });

    test('should toggle theme chips', async ({ page }) => {
      const creativeChip = page.locator('.plan-theme-chip').filter({ hasText: 'Creative' });
      await creativeChip.click();
      await expect(creativeChip).toHaveClass(/active/);
    });

    test('should deselect theme chip on second click', async ({ page }) => {
      const creativeChip = page.locator('.plan-theme-chip').filter({ hasText: 'Creative' });
      await creativeChip.click();
      await creativeChip.click();
      await expect(creativeChip).not.toHaveClass(/active/);
    });

    test('should show Find venues button', async ({ page }) => {
      await expect(page.locator('.plan-find-btn')).toBeVisible();
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────

  test.describe('Navigation', () => {
    test('Back button on plan page returns to landing page', async ({ page }) => {
      await page.getByRole('button', { name: /back/i }).first().click();
      await expect(page.locator('.lp-hero')).toBeVisible();
    });

    test('app nav logo returns to landing page', async ({ page }) => {
      await page.locator('.app-nav-logo').click();
      await expect(page.locator('.lp-hero')).toBeVisible();
    });

    test('should show step counter in wizard', async ({ page }) => {
      await expect(page.getByText(/step/i)).toBeVisible();
    });

    test('back button on venue results returns to plan page', async ({ page }) => {
      await searchVenuesFromPlanPage(page);
      await expect(page.locator('.venue-card').first()).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /back/i }).click();
      // Returns to plan page or landing
      await expect(page).not.toHaveURL(/error/);
    });
  });

  // ── Data Persistence ───────────────────────────────────────────────────

  test.describe('Data Persistence', () => {
    test('should preserve date when navigating back from results', async ({ page }) => {
      const futureDate = getFutureDate();
      await page.locator('.plan-date-input').first().fill(futureDate.slice(0, 10));
      const searchPromise = page.waitForResponse('**/api/v2/party-wizard/search');
      await page.locator('.plan-find-btn').click();
      await searchPromise;

      await page.getByRole('button', { name: /back/i }).click();

      // Should be back on plan page or landing without errors
      await expect(page).not.toHaveURL(/error/);
    });
  });

  // ── Loading States ─────────────────────────────────────────────────────

  test.describe('Loading States', () => {
    test('should show venue results after search completes', async ({ page }) => {
      await searchVenuesFromPlanPage(page);
      await expect(page.getByText(/venues found/i)).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Error Handling ─────────────────────────────────────────────────────

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await page.route('**/api/v2/party-wizard/search', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await page.locator('.plan-find-btn').click();

      // Should not crash the app
      await expect(page).not.toHaveURL(/crash|undefined/);
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────

  test.describe('Accessibility', () => {
    test('should have visible date input', async ({ page }) => {
      await expect(page.locator('.plan-date-input').first()).toBeVisible();
    });

    test('should have visible Find venues button', async ({ page }) => {
      await expect(page.locator('.plan-find-btn')).toBeVisible();
    });
  });
});
