import type { APIRoute } from 'astro';
import { createAgentCatalog, getPublicRoutes } from '../../lib/public-discovery';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(createAgentCatalog(await getPublicRoutes())), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
