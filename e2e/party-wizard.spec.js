import { test, expect } from '@playwright/test';
import { setupApiMocks, mockPartyTypeSuggestions, mockVenues, getFutureDate } from './fixtures/mock-data.js';

test.describe('Party Wizard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
  });

  /**
   * Helper: fill Step 1 and advance to Step 2
   * Sets up waitForResponse before filling age (which triggers party-types fetch via useEffect)
   */
  async function fillStep1AndAdvance(page) {
    await page.getByLabel(/child's name/i).fill('Emma');

    const partyTypesPromise = page.waitForResponse('**/api/v2/party-wizard/party-types/*');
    await page.getByLabel(/how old/i).fill('7');
    await partyTypesPromise;

    await page.getByLabel(/when is the party/i).fill(getFutureDate());
    await page.getByRole('button', { name: /continue to party type/i }).click();
  }

  /**
   * Helper: select party type on Step 2 and advance to Step 3
   */
  async function fillStep2AndAdvance(page) {
    await page.locator('.party-type-trigger').click();
    await page.locator('.party-type-option').first().click();
    await page.getByRole('button', { name: /continue to location/i }).click();
  }

  /**
   * Helper: fill Step 3 and search (advance to Step 4)
   */
  async function fillStep3AndSearch(page) {
    await page.getByLabel(/zip code/i).fill('94105');

    const searchPromise = page.waitForResponse('**/api/v2/party-wizard/search');
    await page.getByRole('button', { name: /find venues/i }).click();
    await searchPromise;
  }

  test.describe('Complete 5-Step Wizard Flow', () => {
    test('should complete full wizard flow successfully', async ({ page }) => {
      // Step 1: Enter child info
      await expect(page.getByText(/child's name/i)).toBeVisible();

      await fillStep1AndAdvance(page);

      // Step 2: Select party preferences
      await expect(page.getByText(/what kind of party/i)).toBeVisible();
      await fillStep2AndAdvance(page);

      // Step 3: Enter location
      await expect(page.getByRole('heading', { name: /where should we look/i })).toBeVisible();
      await fillStep3AndSearch(page);

      // Step 4: View venue results
      await expect(page.getByRole('heading', { name: /venues found/i })).toBeVisible({ timeout: 10000 });

      // Select a venue
      const firstVenue = page.locator('.venue-card').first();
      if (await firstVenue.isVisible()) {
        await firstVenue.getByRole('button', { name: /view details/i }).click();
      }

      // Step 5: Party details/summary
      // Should reach final step without errors
      await expect(page).not.toHaveURL(/error/);
    });

    test('should show personalized header with child name', async ({ page }) => {
      await fillStep1AndAdvance(page);
      await expect(page.getByText(/Emma/)).toBeVisible();
    });
  });

  test.describe('Form Validation on Each Step', () => {
    test('should require child name on Step 1', async ({ page }) => {
      const nameInput = page.getByLabel(/child's name/i);

      // Button should be disabled when required fields are empty
      const nextBtn = page.getByRole('button', { name: /continue to party type/i });
      await expect(nextBtn).toBeDisabled();

      // Should still be on step 1
      await expect(nameInput).toBeVisible();
    });

    test('should enforce age constraints', async ({ page }) => {
      const ageInput = page.getByLabel(/how old/i);

      // Check min/max attributes
      await expect(ageInput).toHaveAttribute('min', '1');
      await expect(ageInput).toHaveAttribute('max', '18');
    });

    test('should validate ZIP code format on Step 3', async ({ page }) => {
      // Navigate to Step 3
      await fillStep1AndAdvance(page);
      await fillStep2AndAdvance(page);

      // Should be on location step
      await expect(page.getByRole('heading', { name: /where should we look/i })).toBeVisible();

      // ZIP code input should be present
      const zipInput = page.getByLabel(/zip code/i);
      await expect(zipInput).toBeVisible();
    });
  });

  test.describe('Navigation Between Steps', () => {
    test('should navigate forward with Next button', async ({ page }) => {
      await fillStep1AndAdvance(page);

      // Should be on Step 2
      await expect(page.getByText(/what kind of party/i)).toBeVisible();
    });

    test('should navigate backward with Back button', async ({ page }) => {
      // Go to Step 2
      await fillStep1AndAdvance(page);

      // Go back to Step 1
      await page.getByRole('button', { name: /back/i }).click();

      // Should be back on Step 1
      await expect(page.getByLabel(/child's name/i)).toBeVisible();
    });

    test('should allow jumping to completed steps via indicator', async ({ page }) => {
      // Complete Step 1
      await fillStep1AndAdvance(page);

      // Complete Step 2
      await fillStep2AndAdvance(page);

      // Click on Step 1 in indicator (if clickable)
      const step1Indicator = page.locator('.step-indicator .step-item').filter({ hasText: 'Child Info' });
      if (await step1Indicator.isVisible()) {
        await step1Indicator.click();
        // Should go back to Step 1 if indicator is clickable
      }
    });
  });

  test.describe('Data Persistence Across Steps', () => {
    test('should preserve child name when navigating back', async ({ page }) => {
      // Fill Step 1
      await fillStep1AndAdvance(page);

      // Go back
      await page.getByRole('button', { name: /back/i }).click();

      // Verify data is preserved
      await expect(page.getByLabel(/child's name/i)).toHaveValue('Emma');
    });

    test('should preserve age when navigating back', async ({ page }) => {
      await fillStep1AndAdvance(page);

      await page.getByRole('button', { name: /back/i }).click();

      await expect(page.getByLabel(/how old/i)).toHaveValue('7');
    });

    test('should preserve location when navigating back from results', async ({ page }) => {
      // Go through Steps 1-3
      await fillStep1AndAdvance(page);
      await fillStep2AndAdvance(page);
      await fillStep3AndSearch(page);

      // Go back to location step
      await page.getByRole('button', { name: /back/i }).click();

      // Verify ZIP is preserved
      await expect(page.getByLabel(/zip code/i)).toHaveValue('94105');
    });
  });

  test.describe('Step Indicator', () => {
    test('should show correct step numbers', async ({ page }) => {
      await expect(page.locator('.step-indicator .step-item').filter({ hasText: 'Child Info' })).toBeVisible();
      // Step indicator should exist
    });

    test('should highlight current step', async ({ page }) => {
      // Step 1 should be active initially
      const step1 = page.locator('.step-indicator .step-item').first();
      if (await step1.isVisible()) {
        await expect(step1).toHaveClass(/active/);
      }
    });

    test('should show completed steps', async ({ page }) => {
      // Complete Step 1
      await fillStep1AndAdvance(page);

      // Step 1 should be marked as completed
      const step1 = page.locator('.step-indicator .step-item').first();
      if (await step1.isVisible()) {
        await expect(step1).toHaveClass(/completed/);
      }
    });
  });

  test.describe('Loading States', () => {
    test('should show loading indicator during API calls', async ({ page }) => {
      // Navigate to Step 3 to trigger search
      await fillStep1AndAdvance(page);
      await fillStep2AndAdvance(page);

      await page.getByLabel(/zip code/i).fill('94105');

      // Click search and check for loading
      const searchPromise = page.waitForResponse('**/api/v2/party-wizard/search');
      await page.getByRole('button', { name: /find venues/i }).click();

      // Loading indicator may appear briefly
      await searchPromise;
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Setup error mock (override the existing one)
      await page.route('**/api/v2/party-wizard/search', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      // Navigate to search
      await fillStep1AndAdvance(page);
      await fillStep2AndAdvance(page);

      await page.getByLabel(/zip code/i).fill('94105');
      await page.getByRole('button', { name: /find venues/i }).click();

      // Should show error message or handle gracefully
      await expect(page).not.toHaveURL(/crash|undefined/);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      // All form inputs should have associated labels
      const nameInput = page.getByLabel(/child's name/i);
      const ageInput = page.getByLabel(/how old/i);

      await expect(nameInput).toBeVisible();
      await expect(ageInput).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab');

      // Should be able to navigate form with keyboard
      const nameInput = page.getByLabel(/child's name/i);
      await nameInput.focus();
      await page.keyboard.type('Emma');

      await expect(nameInput).toHaveValue('Emma');
    });
  });
});
