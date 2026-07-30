import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import {
  collectionMarkdownPaths,
  markdownResponse,
  renderBodyPartMarkdown,
} from '@/lib/agent-markdown';

export const getStaticPaths = () => collectionMarkdownPaths('bodyParts');

export const GET: APIRoute = ({ props }) =>
  markdownResponse(renderBodyPartMarkdown(props.entry as CollectionEntry<'bodyParts'>));
