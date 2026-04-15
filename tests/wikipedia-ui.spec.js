import { test, expect } from '@playwright/test';

test.describe('Wikipedia Spanish UI Tests', () => {
  test('homepage loads successfully and welcome section is visible', async ({ page }) => {
    await page.goto('https://es.wikipedia.org');
    await expect(page).toHaveTitle(/Wikipedia/);
    const welcomeHeading = page.locator('h1.firstHeading');
    await expect(welcomeHeading).toBeVisible();
  });

  test('search input is visible and enabled', async ({ page }) => {
    await page.goto('https://es.wikipedia.org');
    const searchInput = page.locator('input[name="search"]').first();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
  });

  test('search functionality works correctly', async ({ page }) => {
    await page.goto('https://es.wikipedia.org');
    const searchInput = page.locator('input[name="search"]').first();
    await searchInput.fill('Madrid');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/Madrid/);
    const articleTitle = page.locator('h1#firstHeading');
    await expect(articleTitle).toBeVisible();
    await expect(articleTitle).toContainText('Madrid');
  });

  test('article page loads and main content is visible', async ({ page }) => {
    await page.goto('https://es.wikipedia.org/wiki/España');
    await page.waitForLoadState('domcontentloaded');
    const articleTitle = page.locator('h1#firstHeading');
    await expect(articleTitle).toBeVisible();
    await expect(articleTitle).toHaveText('España');
    const mainContent = page.locator('#mw-content-text');
    await expect(mainContent).toBeVisible();
  });

  test('table of contents is visible on article page', async ({ page }) => {
    await page.goto('https://es.wikipedia.org/wiki/Historia');
    await page.waitForLoadState('domcontentloaded');
    const toc = page.locator('#toc, .vector-toc');
    await expect(toc).toBeVisible();
  });

  test('navigation links are visible and enabled', async ({ page }) => {
    await page.goto('https://es.wikipedia.org');
    const portalLink = page.locator('a[href="/wiki/Portal:Portada"]').first();
    await expect(portalLink).toBeVisible();
    await expect(portalLink).toBeEnabled();
  });

  test('article navigation and redirect work correctly', async ({ page }) => {
    await page.goto('https://es.wikipedia.org');
    const searchInput = page.locator('input[name="search"]').first();
    await searchInput.fill('Barcelona');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/Barcelona/);
    const heading = page.locator('h1#firstHeading');
    await expect(heading).toBeVisible();
  });

  test('critical UI elements are present on homepage', async ({ page }) => {
    await page.goto('https://es.wikipedia.org');
    const logo = page.locator('.mw-wiki-logo');
    await expect(logo).toBeVisible();
    const searchButton = page.locator('button[type="submit"]').first();
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toBeEnabled();
  });

  test('article sections are visible', async ({ page }) => {
    await page.goto('https://es.wikipedia.org/wiki/Ciencia');
    await page.waitForLoadState('domcontentloaded');
    const sections = page.locator('.mw-heading');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
    await expect(sections.first()).toBeVisible();
  });

  test('internal article links are functional', async ({ page }) => {
    await page.goto('https://es.wikipedia.org/wiki/Tecnología');
    await page.waitForLoadState('domcontentloaded');
    const firstLink = page.locator('#mw-content-text a[href^="/wiki/"]').first();
    await expect(firstLink).toBeVisible();
    await expect(firstLink).toBeEnabled();
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^\/wiki\//); 
  });
});
