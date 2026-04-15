import { test, expect } from '@playwright/test';

test.describe('Wikipedia Spanish API Tests', () => {
  const API_URL = 'https://es.wikipedia.org/w/api.php';

  test('API endpoint responds with HTTP 200', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        format: 'json',
      },
    });
    expect(response.status()).toBe(200);
  });

  test('search request returns valid JSON payload', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: 'Madrid',
        format: 'json',
      },
    });
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    const data = await response.json();
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });

  test('search response structure is valid', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: 'Barcelona',
        format: 'json',
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('query');
    expect(data.query).toHaveProperty('search');
    expect(Array.isArray(data.query.search)).toBe(true);
  });

  test('at least one result returned for valid search term', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: 'España',
        format: 'json',
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.query.search.length).toBeGreaterThan(0);
    const firstResult = data.query.search[0];
    expect(firstResult).toHaveProperty('title');
    expect(firstResult).toHaveProperty('pageid');
  });

  test('search result contains expected properties', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: 'Historia',
        format: 'json',
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    const firstResult = data.query.search[0];
    expect(firstResult).toHaveProperty('title');
    expect(firstResult).toHaveProperty('pageid');
    expect(firstResult).toHaveProperty('snippet');
    expect(typeof firstResult.title).toBe('string');
    expect(typeof firstResult.pageid).toBe('number');
  });

  test('API response time is within acceptable threshold', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: 'Ciencia',
        format: 'json',
      },
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000);
  });

  test('page content retrieval returns valid data', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        prop: 'extracts',
        titles: 'Madrid',
        format: 'json',
        exintro: true,
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('query');
    expect(data.query).toHaveProperty('pages');
    const pages = data.query.pages;
    const pageIds = Object.keys(pages);
    expect(pageIds.length).toBeGreaterThan(0);
    const page = pages[pageIds[0]];
    expect(page).toHaveProperty('title');
  });

  test('multiple search results are returned', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: 'Arte',
        srlimit: 5,
        format: 'json',
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.query.search.length).toBeGreaterThanOrEqual(1);
    expect(data.query.search.length).toBeLessThanOrEqual(5);
  });

  test('API handles special characters in search', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: 'Música',
        format: 'json',
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.query.search.length).toBeGreaterThan(0);
  });

  test('API returns searchinfo metadata', async ({ request }) => {
    const response = await request.get(API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: 'Tecnología',
        format: 'json',
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.query).toHaveProperty('searchinfo');
    expect(data.query.searchinfo).toHaveProperty('totalhits');
    expect(typeof data.query.searchinfo.totalhits).toBe('number');
  });
});
