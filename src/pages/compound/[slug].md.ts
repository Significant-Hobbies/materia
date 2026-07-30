import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import {
  collectionMarkdownPaths,
  markdownResponse,
  renderCompoundMarkdown,
} from '@/lib/agent-markdown';

export const getStaticPaths = () => collectionMarkdownPaths('compounds');

export const GET: APIRoute = ({ props }) =>
  markdownResponse(renderCompoundMarkdown(props.entry as CollectionEntry<'compounds'>));
