/**
 * Pages Functions middleware — agent SEO surfaces for materia.significanthobbies.com.
 *
 * Handles: /openapi.json, JSON errors for unknown /api/* paths,
 * Accept: text/markdown negotiation, Vary: Accept on HTML with markdown
 * alternates, and agent-friendly 404 with markdown recovery body.
 */
interface Env {
  ASSETS: Fetcher;
}

const ORIGIN = 'https://materia.significanthobbies.com';

const KNOWN_MD_PAGES = new Set(['/']);

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
            content: { 'application/json': {} },
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
        responses: { '200': { description: 'Markdown index', content: { 'text/plain': {} } } },
      },
    },
    '/sitemap.xml': {
      get: {
        operationId: 'getSitemap',
        tags: ['agent-surfaces'],
        summary: 'Sitemap',
        responses: { '200': { description: 'XML sitemap', content: { 'application/xml': {} } } },
      },
    },
    '/openapi.json': {
      get: {
        operationId: 'getOpenApiSpec',
        tags: ['agent-surfaces'],
        summary: 'OpenAPI specification',
        description: 'This document.',
        responses: { '200': { description: 'OpenAPI 3.1 spec', content: { 'application/json': {} } } },
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

function jsonError(status: number, code: string, message: string, path: string): Response {
  return new Response(
    JSON.stringify({ error: { code, message, path } }),
    {
      status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    },
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
  return new Response(body, {
    status: 404,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = url.origin;

  // /openapi.json — serve the spec directly.
  if (pathname === '/openapi.json' || pathname === '/openapi.yaml') {
    return new Response(JSON.stringify(OPENAPI_SPEC, null, 2), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  }

  // /api/ai — serve from static api-ai.json via the assets binding.
  if (pathname === '/api/ai' || pathname === '/api-ai.json') {
    const assetUrl = new URL('/api-ai.json', url);
    const assetReq = new Request(assetUrl.toString(), request);
    const resp = await env.ASSETS.fetch(assetReq);
    if (resp.status === 200) {
      const headers = new Headers(resp.headers);
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
    KNOWN_MD_PAGES.has(normalizePath(pathname))
  ) {
    const mdPath = pathname === '/' ? '/index.md' : `${normalizePath(pathname)}.md`;
    const mdUrl = new URL(mdPath, url);
    const mdReq = new Request(mdUrl.toString(), request);
    const mdResp = await env.ASSETS.fetch(mdReq);
    if (mdResp.status === 200) {
      const headers = new Headers(mdResp.headers);
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
    const headers = new Headers(response.headers);
    headers.set('vary', 'Accept, Accept-Encoding');
    return new Response(response.body, { status: 404, headers });
  }

  // Add Vary: Accept, Accept-Encoding to HTML responses that have markdown alternates.
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 200 && contentType.includes('text/html') && KNOWN_MD_PAGES.has(normalizePath(pathname))) {
    const headers = new Headers(response.headers);
    const existingVary = headers.get('vary');
    headers.set('vary', existingVary ? `${existingVary}, Accept, Accept-Encoding` : 'Accept, Accept-Encoding');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  return response;
};
