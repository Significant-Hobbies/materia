import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getCollection } = vi.hoisted(() => ({ getCollection: vi.fn() }));
vi.mock('astro:content', () => ({ getCollection }));

import {
  createAgentCatalog,
  createLlmsText,
  getPublicRoutes,
  SITE_ORIGIN,
} from '../public-discovery';

const entries = {
  bodyParts: [
    {
      id: 'heart',
      data: { name: 'Heart', summary: 'Circulatory organ.', conditions: [] },
      body: '',
    },
  ],
  conditions: [
    {
      id: 'hypertension',
      data: {
        name: 'Hypertension',
        summary: 'Persistently elevated blood pressure.',
        bodyParts: [],
      },
      body: '',
    },
  ],
  remedies: [
    {
      id: 'garlic',
      data: {
        name: 'Garlic',
        summary: 'A culinary herb studied for cardiovascular outcomes.',
        compounds: [],
        efficacy: [
          {
            condition: { id: 'hypertension' },
            grade: 'B',
            summary: 'Evidence suggests a modest effect.',
          },
        ],
      },
      body: '',
    },
  ],
  compounds: [
    { id: 'allicin', data: { name: 'Allicin', summary: 'An organosulfur compound.' }, body: '' },
  ],
  studies: [
    {
      id: 'example-study',
      data: {
        title: 'Example study',
        effect: 'Reported a measured outcome.',
        design: 'rct',
        year: 2025,
        url: 'https://example.com/study',
      },
      body: '',
    },
  ],
};

beforeEach(() => {
  getCollection.mockImplementation(async (name: keyof typeof entries) => entries[name]);
});

describe('public discovery inventory', () => {
  it('includes all static and public collection routes exactly once', async () => {
    const routes = await getPublicRoutes();
    const paths = routes.map((route) => route.path);

    expect(routes).toHaveLength(17);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain('/');
    expect(paths).toContain('/part/heart');
    expect(paths).toContain('/condition/hypertension');
    expect(paths).toContain('/remedy/garlic');
    expect(paths).toContain('/compound/allicin');
    expect(paths).toContain('/study/example-study');
  });

  it('excludes operational and data-only routes', async () => {
    const paths = (await getPublicRoutes()).map((route) => route.path);

    expect(paths).not.toContain('/404');
    expect(paths).not.toContain('/api/ai');
    expect(paths).not.toContain('/data/materia-graph.json');
    expect(paths).not.toContain('/llms.txt');
  });

  it('maps every canonical route to a useful Markdown mirror', async () => {
    const routes = await getPublicRoutes();

    for (const route of routes) {
      expect(route.markdownPath).toMatch(/\.md$/);
      expect(route.markdown).toContain(`# ${route.title}`);
      expect(route.markdown).toContain(
        `Canonical: ${SITE_ORIGIN}${route.path === '/' ? '/' : route.path}`
      );
    }
    expect(routes.find((route) => route.path === '/')?.markdownPath).toBe('/index.md');
    expect(routes.find((route) => route.path === '/remedy/garlic')?.markdown).toContain(
      '[hypertension](https://materia.significanthobbies.com/condition/hypertension) — grade B'
    );
  });
});

describe('generated agent surfaces', () => {
  it('catalogs every route and its Markdown mirror', async () => {
    const routes = await getPublicRoutes();
    const catalog = createAgentCatalog(routes);

    expect(catalog.surfaces).toHaveLength(routes.length);
    expect(catalog.surfaces.every((surface) => surface.url.startsWith(SITE_ORIGIN))).toBe(true);
    expect(catalog.surfaces.every((surface) => surface.md.endsWith('.md'))).toBe(true);
    expect(catalog.sitemap).toBe(`${SITE_ORIGIN}/sitemap-index.xml`);
    expect(catalog).not.toHaveProperty('openapi');
  });

  it('keeps llms.txt compact and points to the complete catalog', async () => {
    const text = createLlmsText(await getPublicRoutes());

    expect(text).toContain(`${SITE_ORIGIN}/api/ai`);
    expect(text).toContain(`${SITE_ORIGIN}/sitemap-index.xml`);
    expect(text).not.toContain('/openapi.json');
    expect(text).not.toContain('/condition/hypertension');
  });
});
