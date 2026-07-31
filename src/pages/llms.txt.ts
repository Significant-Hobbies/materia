import type { APIRoute } from 'astro';
import { createLlmsText, getPublicRoutes } from '../lib/public-discovery';

export const GET: APIRoute = async () =>
  new Response(createLlmsText(await getPublicRoutes()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
