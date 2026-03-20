import { test, expect } from '@playwright/test';
import {
  setupApiMocks,
  mockVenues,
} from './fixtures/mock-data.js';

// ── Autocomplete mock helper ──────────────────────────────────────────────────

async function setupAutocompleteMock(page) {
  await page.route('**/api/v2/places/autocomplete**', async (route) => {
    const url = new URL(route.request().url());
    const input = url.searchParams.get('input') ?? '';
    const suggestions = input.length >= 2
      ? ['London, UK', 'Los Angeles, CA', 'Louisville, KY']
      : [];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(suggestions),
    });
  });
}

// ── Suite ─────────────────────────────────────────────────────────────────────

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupAutocompleteMock(page);
    await page.goto('/');
  });

  // ── Basic rendering ────────────────────────────────────────────────────

  test('landing page renders on app load', async ({ page }) => {
    await expect(page.getByText(/join the waitlist for early access/i)).toBeVisible();
    await expect(page.getByText(/plan the perfect party/i)).toBeVisible();
    await expect(page.getByText(/every celebration/i)).toBeVisible();
    await expect(page.getByText(/celebrating someone specific/i)).toBeVisible();
    await expect(page.getByText(/how it works/i)).toBeVisible();
  });

  test('landing page shows PartyScout logo in navbar', async ({ page }) => {
    await expect(page.locator('.lp-logo')).toBeVisible();
    await expect(page.locator('.lp-logo-party')).toHaveText('Party');
  });

  test('landing page shows all 5 idea cards', async ({ page }) => {
    await expect(page.getByText('Escape Room')).toBeVisible();
    await expect(page.getByText('Boba Tea')).toBeVisible();
    await expect(page.getByText('Ice Cream')).toBeVisible();
    await expect(page.getByText('Pottery')).toBeVisible();
    await expect(page.getByText('Axe Throwing')).toBeVisible();
  });

  test('landing page shows all 4 persona chips', async ({ page }) => {
    await expect(page.getByText('Little Kids')).toBeVisible();
    await expect(page.getByText('Tweens')).toBeVisible();
    await expect(page.getByText('Teens')).toBeVisible();
    await expect(page.getByText('Adults')).toBeVisible();
  });

  test('persona chip shows correct age range labels', async ({ page }) => {
    await expect(page.getByText('Under 7')).toBeVisible();
    await expect(page.getByText(/Ages 8/)).toBeVisible();
    await expect(page.getByText(/Ages 14/)).toBeVisible();
    await expect(page.getByText('18 & over')).toBeVisible();
  });

  // ── Navigation via "Find ideas" ────────────────────────────────────────

  test('clicking "Find ideas" navigates to wizard step 1', async ({ page }) => {
    await page.getByRole('button', { name: /find ideas/i }).click();
    // Landing page should no longer be visible; wizard step 1 should appear
    await expect(page.getByText(/join the waitlist for early access/i)).not.toBeVisible();
    // Early-access banner of wizard appears instead
    await expect(page.getByText(/early access/i)).toBeVisible();
  });

  // ── Navigation via persona chips ───────────────────────────────────────

  test('clicking Teens persona chip navigates to wizard', async ({ page }) => {
    await page.getByText('Teens').locator('..').click();
    // Landing page hidden, wizard visible
    await expect(page.getByText(/join the waitlist for early access/i)).not.toBeVisible();
  });

  test('clicking Little Kids persona chip navigates to wizard', async ({ page }) => {
    await page.getByText('Little Kids').locator('..').click();
    await expect(page.getByText(/join the waitlist for early access/i)).not.toBeVisible();
  });

  // ── Navigation via idea card ───────────────────────────────────────────

  test('clicking Boba Tea card goes directly to step 4 venue results', async ({ page }) => {
    const searchPromise = page.waitForResponse('**/api/v2/party-wizard/search');
    await page.getByText('Boba Tea').click();
    await searchPromise;

    // Should be on venue results (step 4)
    await expect(page.getByText(/venues found/i)).toBeVisible({ timeout: 10000 });
  });

  test('clicking Escape Room card triggers venue search', async ({ page }) => {
    const searchPromise = page.waitForResponse('**/api/v2/party-wizard/search');
    await page.getByText('Escape Room').click();
    await searchPromise;

    await expect(page.getByText(/venues found/i)).toBeVisible({ timeout: 10000 });
  });

  // ── Logo click in wizard returns to landing page ───────────────────────

  test('clicking PartyScout logo in wizard returns to landing page', async ({ page }) => {
    // Navigate to wizard
    await page.getByRole('button', { name: /find ideas/i }).click();
    await expect(page.locator('.wizard-logo')).toBeVisible();

    // Click logo to go back to landing
    await page.locator('.wizard-logo').click();

    // Landing page should be visible again
    await expect(page.getByText(/join the waitlist for early access/i)).toBeVisible();
    await expect(page.getByText(/every celebration/i)).toBeVisible();
  });

  // ── "See all →" link ───────────────────────────────────────────────────

  test('"See all →" link triggers venue search for birthday party venues', async ({ page }) => {
    const searchPromise = page.waitForResponse('**/api/v2/party-wizard/search');
    await page.getByText(/see all/i).click();
    await searchPromise;

    await expect(page.getByText(/venues found/i)).toBeVisible({ timeout: 10000 });
  });

  // ── City input autocomplete ────────────────────────────────────────────

  test('city input shows autocomplete dropdown when typing 2+ characters', async ({ page }) => {
    const cityInput = page.locator('.lp-city-input');
    await expect(cityInput).toBeVisible();

    await cityInput.fill('Lo');
    // Wait for debounce (300 ms) and API response
    await page.waitForResponse('**/api/v2/places/autocomplete**');

    // Dropdown should appear
    await expect(page.locator('.city-ac-dropdown')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.city-ac-option').first()).toBeVisible();
  });

  test('city input does NOT show autocomplete dropdown when input is empty', async ({ page }) => {
    const cityInput = page.locator('.lp-city-input');
    // Empty input — no fetch is triggered
    await cityInput.fill('');

    await page.waitForTimeout(500);

    await expect(page.locator('.city-ac-dropdown')).not.toBeVisible();
  });

  test('clicking autocomplete suggestion populates city input', async ({ page }) => {
    const cityInput = page.locator('.lp-city-input');
    await cityInput.fill('Lo');

    await page.waitForResponse('**/api/v2/places/autocomplete**');

    // Click the first suggestion
    await page.locator('.city-ac-option').first().click();

    // Input should now have the selected city value
    const value = await cityInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  // ── Saved panel ────────────────────────────────────────────────────────

  test('Saved panel opens when clicking Saved button', async ({ page }) => {
    await page.getByRole('button', { name: /saved/i }).click();
    // SavedEventsPanel renders with open=true
    await expect(page.locator('[data-testid="saved-panel"], .saved-panel, .slide-panel')).toBeVisible({
      timeout: 5000,
    });
  });

  // ── Occasion pills ─────────────────────────────────────────────────────

  test('Birthday pill is active by default', async ({ page }) => {
    const birthdayPill = page.getByRole('button', { name: /birthday/i }).first();
    await expect(birthdayPill).toHaveClass(/lp-pill--active/);
  });

  test('clicking Just Because pill changes section title', async ({ page }) => {
    await page.getByRole('button', { name: /just because/i }).click();
    await expect(page.getByText(/top ideas near you/i)).toBeVisible();
  });

  // ── How it works section ───────────────────────────────────────────────

  test('"How it works" section shows 3 steps', async ({ page }) => {
    await expect(page.getByText(/01 — Pick an occasion/)).toBeVisible();
    await expect(page.getByText(/02 — Save ideas/)).toBeVisible();
    await expect(page.getByText(/03 — Make it happen/)).toBeVisible();
  });

  // ── Footer ─────────────────────────────────────────────────────────────

  test('footer CTA buttons navigate to wizard', async ({ page }) => {
    await page.getByRole('button', { name: /find birthday ideas/i }).click();
    await expect(page.getByText(/join the waitlist for early access/i)).not.toBeVisible();
  });
});
