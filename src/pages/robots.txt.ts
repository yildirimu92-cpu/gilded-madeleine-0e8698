import type { APIRoute } from 'astro';
import { robotsTxt } from '../lib/site-config';

export const GET: APIRoute = () =>
  new Response(robotsTxt(process.env), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
