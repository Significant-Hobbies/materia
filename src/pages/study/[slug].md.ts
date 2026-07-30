import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import {
  collectionMarkdownPaths,
  markdownResponse,
  renderStudyMarkdown,
} from '@/lib/agent-markdown';

export const getStaticPaths = () => collectionMarkdownPaths('studies');

export const GET: APIRoute = ({ props }) =>
  markdownResponse(renderStudyMarkdown(props.entry as CollectionEntry<'studies'>));
