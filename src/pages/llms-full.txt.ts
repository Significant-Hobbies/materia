import type { APIRoute } from 'astro';
import { createLlmsFullText, getPublicRoutes } from '../lib/public-discovery';

export const GET: APIRoute = async () =>
  new Response(createLlmsFullText(await getPublicRoutes()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
