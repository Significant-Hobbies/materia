import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import {
  collectionMarkdownPaths,
  markdownResponse,
  renderConditionMarkdown,
} from '@/lib/agent-markdown';

export const getStaticPaths = () => collectionMarkdownPaths('conditions');

export const GET: APIRoute = ({ props }) =>
  markdownResponse(renderConditionMarkdown(props.entry as CollectionEntry<'conditions'>));
