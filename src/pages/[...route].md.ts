import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublicRoutes } from '../lib/public-discovery';

export const getStaticPaths: GetStaticPaths = async () =>
  (await getPublicRoutes()).map((route) => ({
    params: { route: route.markdownPath.slice(1, -3) },
    props: { markdown: route.markdown },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(props.markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
