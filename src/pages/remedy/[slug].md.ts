import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import {
  collectionMarkdownPaths,
  markdownResponse,
  renderRemedyMarkdown,
} from '@/lib/agent-markdown';

export const getStaticPaths = () => collectionMarkdownPaths('remedies');

export const GET: APIRoute = ({ props }) =>
  markdownResponse(renderRemedyMarkdown(props.entry as CollectionEntry<'remedies'>));
