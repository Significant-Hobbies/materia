/**
 * Pages Functions middleware — agent SEO surfaces for materia.significanthobbies.com.
 *
 * Handles: /openapi.json, JSON errors for unknown /api/* paths,
 * Accept: text/markdown negotiation, Vary: Accept on HTML with markdown
 * alternates, rate-limit headers, and agent-friendly 404 with markdown recovery body.
 */
interface Env {
  ASSETS: Fetcher;
}

const ORIGIN = 'https://materia.significanthobbies.com';

// Static pages that have generated .md alternates (see src/lib/public-discovery.ts).
const STATIC_MD_PAGES = new Set([
  '/',
  '/about',
  '/checker',
  '/compounds',
  '/conditions',
  '/data',
  '/disclaimer',
  '/faq',
  '/methodology',
  '/parts',
  '/remedies',
  '/search',
]);

// Entity pages follow /<kind>/<slug> and also have .md alternates.
const ENTITY_MD_PREFIXES = ['/part/', '/condition/', '/remedy/', '/compound/', '/study/'];

function hasMarkdownAlternate(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  if (STATIC_MD_PAGES.has(normalized)) return true;
  return ENTITY_MD_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

const RATE_LIMIT = 60;
const RATE_LIMIT_WINDOW = 60;

const ERROR_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Machine-readable error code' },
        message: { type: 'string', description: 'Human-readable error message' },
        path: { type: 'string', description: 'The request path that caused the error' },
      },
      required: ['code', 'message'],
    },
  },
  required: ['error'],
};

const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'Materia public API',
    version: '1.0.0',
    description:
      'Evidence-graded reference for remedies organized by body part. The public web API exposes read-only agent surfaces: the agent catalog, llms.txt, sitemap, and markdown alternates.',
    contact: { name: 'Materia', url: ORIGIN },
  },
  servers: [{ url: ORIGIN }],
  tags: [{ name: 'agent-surfaces', description: 'Machine-readable public surfaces' }],
  components: {
    schemas: {
      AgentCatalog: {
        type: 'object',
        description: 'JSON inventory of public agent surfaces and per-page markdown alternates.',
        properties: {
          name: { type: 'string' },
          version: { type: 'integer' },
          url: { type: 'string', format: 'uri' },
          llms: { type: 'string', format: 'uri' },
          sitemap: { type: 'string', format: 'uri' },
          robots: { type: 'string', format: 'uri' },
          openapi: { type: 'string', format: 'uri' },
          markdown: {
            type: 'object',
            properties: {
              suffix: { type: 'string' },
              homepage: { type: 'string', format: 'uri' },
              negotiation: { type: 'boolean' },
            },
          },
          routes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                url: { type: 'string', format: 'uri' },
                markdown: { type: 'string', format: 'uri' },
                kind: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
      ErrorResponse: ERROR_RESPONSE_SCHEMA,
    },
  },
  paths: {
    '/api/ai': {
      get: {
        operationId: 'getAgentCatalog',
        tags: ['agent-surfaces'],
        summary: 'Agent catalog',
        description:
          'JSON inventory of public agent surfaces: llms.txt, sitemap, robots, and per-page markdown alternates.',
        responses: {
          '200': {
            description: 'Agent catalog',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AgentCatalog' } } },
          },
          '404': {
            description: 'Unknown API path',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '429': {
            description: 'Rate limit exceeded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '500': {
            description: 'Internal server error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/llms.txt': {
      get: {
        operationId: 'getLlmsTxt',
        tags: ['agent-surfaces'],
        summary: 'llms.txt index',
        description: 'Compact agent index following the llms.txt convention.',
        responses: {
          '200': {
            description: 'Markdown index',
            content: { 'text/plain': { schema: { type: 'string' } } },
          },
          '429': {
            description: 'Rate limit exceeded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/sitemap.xml': {
      get: {
        operationId: 'getSitemap',
        tags: ['agent-surfaces'],
        summary: 'Sitemap',
        description: 'XML sitemap of all canonical public HTML pages.',
        responses: {
          '200': {
            description: 'XML sitemap',
            content: { 'application/xml': { schema: { type: 'string' } } },
          },
          '429': {
            description: 'Rate limit exceeded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/openapi.json': {
      get: {
        operationId: 'getOpenApiSpec',
        tags: ['agent-surfaces'],
        summary: 'OpenAPI specification',
        description: 'This document.',
        responses: {
          '200': {
            description: 'OpenAPI 3.1 spec',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '429': {
            description: 'Rate limit exceeded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
  },
};

function wantsMarkdown(request: Request): boolean {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (!accept.includes('text/markdown')) return false;
  if (!accept.includes('text/html')) return true;
  return accept.indexOf('text/markdown') < accept.indexOf('text/html');
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

function withRateLimit(headers: Headers): Headers {
  headers.set('ratelimit-limit', String(RATE_LIMIT));
  headers.set('ratelimit-remaining', String(RATE_LIMIT));
  headers.set('ratelimit-reset', String(RATE_LIMIT_WINDOW));
  return headers;
}

function jsonError(status: number, code: string, message: string, path: string): Response {
  const headers = withRateLimit(new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
  }));
  return new Response(
    JSON.stringify({ error: { code, message, path } }),
    { status, headers },
  );
}

function markdown404(pathname: string, origin: string): Response {
  const path = normalizePath(pathname);
  const body = `# 404 — Not Found

\`${path}\` does not exist on ${origin}.

## Where to look next

- [Home](${origin}/)
- [Sitemap](${origin}/sitemap.xml)
- [Agent index](${origin}/llms.txt)
- [Agent catalog (JSON)](${origin}/api/ai)
- [OpenAPI spec](${origin}/openapi.json)
`;
  const headers = withRateLimit(new Headers({
    'content-type': 'text/markdown; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  }));
  return new Response(body, { status: 404, headers });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = url.origin;

  // /openapi.json — serve the spec directly.
  if (pathname === '/openapi.json' || pathname === '/openapi.yaml') {
    const headers = withRateLimit(new Headers({
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    }));
    return new Response(JSON.stringify(OPENAPI_SPEC, null, 2), { headers });
  }

  // /api/ai — serve from static api-ai.json via the assets binding.
  if (pathname === '/api/ai' || pathname === '/api-ai.json') {
    const assetUrl = new URL('/api-ai.json', url);
    const assetReq = new Request(assetUrl.toString(), request);
    const resp = await env.ASSETS.fetch(assetReq);
    if (resp.status === 200) {
      const headers = withRateLimit(new Headers(resp.headers));
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('access-control-allow-origin', '*');
      return new Response(request.method === 'HEAD' ? null : resp.body, { status: 200, headers });
    }
    return resp;
  }

  // JSON errors for unknown /api/* paths.
  if (pathname.startsWith('/api/')) {
    return jsonError(404, 'not_found', `Unknown API path: ${pathname}`, pathname);
  }

  // Accept: text/markdown negotiation for HTML pages that have a .md alternate.
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    !pathname.endsWith('.md') &&
    !pathname.endsWith('.json') &&
    !pathname.endsWith('.xml') &&
    !pathname.includes('.') &&
    wantsMarkdown(request) &&
    hasMarkdownAlternate(pathname)
  ) {
    const mdPath = pathname === '/' ? '/index.md' : `${normalizePath(pathname)}.md`;
    const mdUrl = new URL(mdPath, url);
    const mdReq = new Request(mdUrl.toString(), { method: request.method });
    const mdResp = await env.ASSETS.fetch(mdReq);
    if (mdResp.status === 200) {
      const headers = withRateLimit(new Headers(mdResp.headers));
      headers.set('content-type', 'text/markdown; charset=utf-8');
      headers.set('vary', 'Accept, Accept-Encoding');
      headers.set('x-content-type-options', 'nosniff');
      return new Response(request.method === 'HEAD' ? null : mdResp.body, { status: 200, headers });
    }
  }

  // Pass through to static assets.
  const response = await next();

  // Agent-friendly 404: markdown body for Accept: text/markdown, or ensure 404 status.
  if (response.status === 404 && !pathname.startsWith('/api/')) {
    if (wantsMarkdown(request)) {
      return markdown404(pathname, origin);
    }
    const headers = withRateLimit(new Headers(response.headers));
    headers.set('vary', 'Accept, Accept-Encoding');
    return new Response(response.body, { status: 404, headers });
  }

  // Add Vary: Accept, Accept-Encoding to HTML responses that have markdown alternates.
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 200 && contentType.includes('text/html') && hasMarkdownAlternate(pathname)) {
    const headers = withRateLimit(new Headers(response.headers));
    const existingVary = headers.get('vary');
    headers.set('vary', existingVary ? `${existingVary}, Accept, Accept-Encoding` : 'Accept, Accept-Encoding');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  // Add rate-limit headers to all other responses.
  const headers = withRateLimit(new Headers(response.headers));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};
