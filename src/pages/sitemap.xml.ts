/** /sitemap.xml: the homepage and every project page, so Google finds them all. */
import type { APIRoute } from 'astro'
import { getProjects } from '../lib/github'
import { SITE_URL } from '../lib/site'

export const GET: APIRoute = async () => {
  const projects = await getProjects()
  const day = (iso: string) => iso.split('T')[0]

  const urls = [
    { loc: `${SITE_URL}/`, lastmod: day(new Date().toISOString()) },
    ...projects.map((p) => ({ loc: `${SITE_URL}/project/${p.name}`, lastmod: day(p.pushedAt) })),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`),
    '</urlset>',
    '',
  ].join('\n')

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
