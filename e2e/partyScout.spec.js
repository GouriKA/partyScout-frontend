import { test, expect } from '@playwright/test';
import { setupApiMocks, getFutureDate } from './fixtures/mock-data.js';

test.describe('PartyScout Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
  });

  /** Fill step 1 and advance to step 2, waiting for party-types API response */
  async function goToStep2(page) {
    const partyTypesPromise = page.waitForResponse('**/api/v2/party-wizard/party-types/*');
    await page.getByLabel(/How old will they be turning/i).fill('7');
    await partyTypesPromise;
    await page.getByLabel(/When is the party/i).fill(getFutureDate());
    await page.getByRole('button', { name: /Continue to Party Type/i }).click();
  }

  /** Select first party type on step 2 and advance to step 3 */
  async function goToStep3(page) {
    await goToStep2(page);
    await page.locator('.party-type-trigger').click();
    await page.locator('.party-type-option').first().click();
    await page.getByRole('button', { name: /Continue to Location/i }).click();
  }

  test('shows wizard header and step 1 on load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Plan Your Birthday Party/i })).toBeVisible();
    await expect(page.getByText('Find the perfect venue in just a few steps')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tell us about the birthday child/i })).toBeVisible();
  });

  test('step indicator shows Child Info as active on load', async ({ page }) => {
    const childInfoStep = page.locator('.step-item.active');
    await expect(childInfoStep).toBeVisible();
    await expect(childInfoStep).toContainText('Child Info');
  });

  test('Continue button is disabled without required fields', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Continue to Party Type/i })).toBeDisabled();
  });

  test('Continue button enables when age and date are filled', async ({ page }) => {
    await page.getByLabel(/How old will they be turning/i).fill('7');
    await page.getByLabel(/When is the party/i).fill(getFutureDate());
    await expect(page.getByRole('button', { name: /Continue to Party Type/i })).toBeEnabled();
  });

  test('personalizes header title when name is entered', async ({ page }) => {
    await page.getByLabel(/Child's name/i).fill('Emma');
    await expect(page.getByRole('heading', { name: /Plan Emma's Birthday Party/i })).toBeVisible();
  });

  test('navigates from step 1 to step 2', async ({ page }) => {
    await goToStep2(page);
    await expect(page.getByRole('heading', { name: /What kind of party/i })).toBeVisible();
  });

  test('step 2 shows Back button and Continue is disabled without party type', async ({ page }) => {
    await goToStep2(page);
    await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue to Location/i })).toBeDisabled();
  });

  test('Back button on step 2 returns to step 1', async ({ page }) => {
    await goToStep2(page);
    await page.getByRole('button', { name: /Back/i }).click();
    await expect(page.getByRole('heading', { name: /Tell us about the birthday child/i })).toBeVisible();
  });

  test('step indicator allows clicking back to completed steps', async ({ page }) => {
    await goToStep2(page);

    const step1Btn = page.locator('.step-item.completed').first();
    await expect(step1Btn).toBeVisible();
    await step1Btn.click();

    await expect(page.getByRole('heading', { name: /Tell us about the birthday child/i })).toBeVisible();
  });

  test('step 3 requires a 5-digit ZIP code to enable Find Venues', async ({ page }) => {
    await goToStep3(page);

    await expect(page.getByRole('heading', { name: /Where should we look/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Find Venues/i })).toBeDisabled();

    await page.getByLabel(/ZIP Code/i).fill('941');
    await expect(page.getByRole('button', { name: /Find Venues/i })).toBeDisabled();

    await page.getByLabel(/ZIP Code/i).fill('94105');
    await expect(page.getByRole('button', { name: /Find Venues/i })).toBeEnabled();
  });

  test('step 3 setting options are selectable', async ({ page }) => {
    await goToStep3(page);

    await page.getByRole('button', { name: /Indoor/i }).click();
    await expect(page.getByRole('button', { name: /Indoor/i })).toHaveClass(/selected/);

    await page.getByRole('button', { name: /Outdoor/i }).click();
    await expect(page.getByRole('button', { name: /Outdoor/i })).toHaveClass(/selected/);
  });

  test('age input only accepts values 1-18', async ({ page }) => {
    const ageInput = page.getByLabel(/How old will they be turning/i);
    await expect(ageInput).toHaveAttribute('max', '18');
    await expect(ageInput).toHaveAttribute('min', '1');
  });

  test('ZIP code input only accepts digits', async ({ page }) => {
    await goToStep3(page);

    const zipInput = page.getByLabel(/ZIP Code/i);
    await zipInput.fill('abc12');
    const value = await zipInput.inputValue();
    expect(value).toMatch(/^\d*$/);
  });
});
