/**
 * Vite build plugin that turns the single-page app into real HTML pages for
 * search engines.
 *
 * The SPA serves the same empty index.html for every URL, so Google saw every
 * project page as a copy of the homepage. After `vite build` this plugin fetches
 * the repos from GitHub and writes:
 *
 *   dist/index.html            homepage with all project cards and links
 *   dist/project/<name>.html   one page per project: own title, description,
 *                              canonical URL, JSON-LD and the rendered README
 *   dist/404.html              plain SPA shell for unknown URLs (served with a
 *                              404 status by Cloudflare Pages)
 *   dist/sitemap.xml           homepage + every project page
 *
 * Each page also embeds its data as JSON, so Vue renders the same content
 * immediately when it mounts. The static markup below mirrors App.vue,
 * HomeView.vue, ProjectList.vue and ProjectDetailView.vue: keep them in sync.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { JSDOM } from 'jsdom'
import createDOMPurify from 'dompurify'
import { renderReadme } from '../src/utils/markdown'
import {
  GITHUB_USER,
  HOME_DESCRIPTION,
  HOME_INTRO,
  HOME_TITLE,
  PRERENDER_DATA_ID,
  SITE_URL,
  isVisibleRepository,
  pickRepository,
  processRepository,
  projectBreadcrumbJsonLd,
  projectDescription,
  projectJsonLd,
  projectPath,
  projectTitle,
  projectUrl,
  projectsListJsonLd,
  sortRepositories,
  type PrerenderData,
  type Repository,
} from '../src/utils/projects'

interface Project {
  repo: Repository
  readme: string | null
}

const DIST = resolve('dist')
const HEAD_BLOCK = /<!--page-head:start-->[\s\S]*?<!--page-head:end-->/
const APP_DIV = '<div id="app"><!--app-html--></div>'

const purify = createDOMPurify(new JSDOM('').window)

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------

function githubHeaders(accept = 'application/vnd.github+json'): Record<string, string> {
  return {
    'User-Agent': `${GITHUB_USER}-portfolio`,
    Accept: accept,
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  }
}

async function fetchWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, init)
      if (res.ok || res.status === 404 || attempt >= attempts) return res
    } catch (err) {
      if (attempt >= attempts) throw err
    }
    await new Promise((r) => setTimeout(r, 1000 * attempt))
  }
}

async function fetchRepositories(): Promise<Repository[]> {
  const res = await fetchWithRetry(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`,
    { headers: githubHeaders() },
  )
  if (!res.ok) throw new Error(`GitHub API responded with ${res.status} for the repo list`)

  const repos = (await res.json()) as Repository[]
  return sortRepositories(
    repos.filter(isVisibleRepository).map(pickRepository).map(processRepository),
  )
}

async function fetchReadme(repo: Repository): Promise<string | null> {
  // raw.githubusercontent.com has no API rate limit, so try the usual file name there first
  const branch = repo.default_branch || 'main'
  const raw = await fetchWithRetry(
    `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${branch}/README.md`,
    { headers: { 'User-Agent': `${GITHUB_USER}-portfolio` } },
  )
  if (raw.ok) return raw.text()

  // Other spellings (readme.md, README.rst, ...) via the API, which finds them for us
  const api = await fetchWithRetry(
    `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/readme`,
    { headers: githubHeaders('application/vnd.github.raw') },
  )
  if (api.status === 404) return null
  if (!api.ok) throw new Error(`GitHub API responded with ${api.status} for ${repo.name}/readme`)
  return api.text()
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** JSON that is safe to place inside a <script> element. */
function scriptJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function jsonLd(id: string, data: unknown): string {
  // Same ids as injectJsonLd() in src/utils/seo.ts, so Vue replaces these blocks instead of duplicating them
  return `<script type="application/ld+json" id="ld-${id}">${scriptJson(data)}</script>`
}

interface HeadOptions {
  title: string
  description: string
  url: string
  image?: string
  jsonLd: string[]
}

function head({ title, description, url, image, jsonLd }: HeadOptions): string {
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    ...(image ? [`<meta property="og:image" content="${esc(image)}">`] : []),
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    ...jsonLd,
  ].join('\n    ')
}

function page(template: string, headHtml: string, bodyHtml: string, data: PrerenderData): string {
  return template
    .replace(HEAD_BLOCK, () => headHtml)
    .replace(
      APP_DIV,
      () =>
        `<div id="app">${bodyHtml}</div>\n    ` +
        `<script type="application/json" id="${PRERENDER_DATA_ID}">${scriptJson(data)}</script>`,
    )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL')
}

/** "View on GitHub ★ n" button; the detail page hides the label on small screens. */
function githubButton(repo: Repository, classes: string, detail: boolean): string {
  const hideOnMobile = detail ? ' d-none d-md-inline' : ''
  return `<a href="${esc(repo.html_url)}" target="_blank" class="${classes}" title="View on GitHub">
          <i class="bi bi-github"></i>
          <span class="${hideOnMobile.trim()}">${detail ? 'View on GitHub' : 'GitHub'}</span>
          <span class="vr mx-1${hideOnMobile}"></span>
          <span><i class="bi bi-star-fill text-warning"></i> ${repo.stargazers_count}</span>
        </a>`
}

// ---------------------------------------------------------------------------
// Page bodies (mirror the Vue templates)
// ---------------------------------------------------------------------------

/** App.vue */
function layout(inner: string): string {
  const linkedIn = `href="https://www.linkedin.com/in/kobe-erauw" target="_blank" rel="noopener noreferrer"`
  return `
<header>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="/">Portfolio</a>
      <a ${linkedIn} class="nav-link ms-auto d-flex align-items-center gap-2">
        <i class="bi bi-linkedin"></i>
        <span>LinkedIn</span>
      </a>
    </div>
  </nav>
</header>
<div class="flex-grow-1">${inner}</div>
<footer class="footer mt-auto py-3 bg-light text-center">
  <div class="container d-flex align-items-center justify-content-center gap-3">
    <span class="text-muted">© ${new Date().getFullYear()} Kobe Erauw</span>
    <a ${linkedIn} class="text-muted d-flex align-items-center gap-1">
      <i class="bi bi-linkedin"></i>
      <span>LinkedIn</span>
    </a>
  </div>
</footer>`
}

/** ProjectList.vue card */
function projectCard(repo: Repository): string {
  const path = esc(projectPath(repo.name))
  return `
    <div class="col">
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <h3 class="card-title h5"><a href="${path}" class="text-reset">${esc(repo.name)}</a></h3>
          ${repo.language ? `<h6 class="card-subtitle mb-2 text-muted">${esc(repo.language)}</h6>` : ''}
          ${
            repo.imageUrl
              ? `<img src="${esc(repo.imageUrl)}" alt="Preview of ${esc(repo.name)}" width="400" height="200" loading="lazy" class="img-fluid mb-3 rounded d-block mx-auto" style="max-height: 200px; object-fit: contain">`
              : ''
          }
          <p class="card-text flex-grow-1">${esc(repo.description ?? '')}</p>
          <div class="mt-3 d-flex justify-content-between align-items-center">
            <a href="${path}" class="btn btn-primary btn-sm">View Details</a>
            ${githubButton(repo, 'btn btn-outline-secondary btn-sm d-flex align-items-center gap-2', false)}
          </div>
        </div>
        <div class="card-footer text-muted small d-flex justify-content-between align-items-center">
          <span class="d-flex align-items-center" title="Created on"><i class="bi bi-calendar-plus me-1"></i> ${formatDate(repo.created_at)}</span>
          <span class="d-flex align-items-center" title="Last commit on"><i class="bi bi-clock-history me-1"></i> ${formatDate(repo.pushed_at)}</span>
        </div>
      </div>
    </div>`
}

/** HomeView.vue + ProjectList.vue */
function homeBody(repos: Repository[]): string {
  return layout(`
<main>
  <div class="px-4 py-5 my-5 text-center">
    <h1 class="display-5 fw-bold"><span>&gt;</span> Kobe Erauw</h1>
    <div class="col-lg-6 mx-auto">
      <p class="lead mb-4" style="font-family: var(--retro-font-mono)">${esc(HOME_INTRO)}</p>
    </div>
  </div>
  <div class="container py-5">
    <h2 class="mb-4 text-center">My Projects</h2>
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">${repos.map(projectCard).join('')}
    </div>
  </div>
</main>`)
}

/** ProjectDetailView.vue */
function projectBody({ repo, readme }: Project): string {
  const branch = repo.default_branch || 'main'
  const content = readme
    ? `<div class="readme-content p-4 border rounded bg-light">${purify.sanitize(renderReadme(readme, repo.name, branch))}</div>`
    : `<div class="alert alert-warning">This project has no README file.</div>`

  return layout(`
<div class="container py-5">
  <a href="/" class="btn btn-outline-secondary mb-4">&larr; Back to overview</a>
  <div>
    <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
      <h1 class="m-0 text-break">${esc(repo.name)}</h1>
      ${githubButton(repo, 'btn btn-dark d-flex align-items-center gap-2 flex-shrink-0', true)}
    </div>
    ${content}
  </div>
</div>`)
}

// ---------------------------------------------------------------------------
// Output files
// ---------------------------------------------------------------------------

function sitemap(projects: Project[]): string {
  const today = new Date().toISOString().split('T')[0]
  const entries = [
    { loc: `${SITE_URL}/`, lastmod: today },
    ...projects.map(({ repo }) => ({
      loc: projectUrl(repo.name),
      lastmod: repo.pushed_at.split('T')[0],
    })),
  ]
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (e) => `  <url>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </url>`,
    ),
    '</urlset>',
    '',
  ].join('\n')
}

async function loadProjects(): Promise<Project[]> {
  const repos = await fetchRepositories()
  return Promise.all(repos.map(async (repo) => ({ repo, readme: await fetchReadme(repo) })))
}

export function prerenderPlugin(): Plugin {
  return {
    name: 'prerender-pages',
    apply: 'build',
    async closeBundle() {
      const template = readFileSync(resolve(DIST, 'index.html'), 'utf-8')
      if (!HEAD_BLOCK.test(template) || !template.includes(APP_DIV)) {
        throw new Error('prerender: page-head markers or <!--app-html--> missing from index.html')
      }

      let projects: Project[] = []
      try {
        projects = await loadProjects()
      } catch (err) {
        const message =
          `prerender: could not fetch projects from GitHub (${err}). ` +
          'Make sure GITHUB_TOKEN is available as a build environment variable.'
        // On Cloudflare Pages, fail the build so the previous (complete) deployment stays live
        // instead of publishing a site without project pages.
        if (process.env.CF_PAGES) throw new Error(message)
        console.warn(`\n⚠  ${message}\n   Writing the homepage without projects.\n`)
      }

      const builtAt = Date.now()
      const repos = projects.map((p) => p.repo)

      // Unknown URLs: plain SPA shell, no canonical. Cloudflare Pages serves it with status 404.
      writeFileSync(resolve(DIST, '404.html'), template.replace('<!--app-html-->', ''))

      writeFileSync(
        resolve(DIST, 'index.html'),
        page(
          template,
          head({
            title: HOME_TITLE,
            description: HOME_DESCRIPTION,
            url: `${SITE_URL}/`,
            jsonLd: repos.length ? [jsonLd('projects-list', projectsListJsonLd(repos))] : [],
          }),
          homeBody(repos),
          // No embedded list when GitHub was unreachable, so the app fetches it instead of showing none
          { builtAt, repos: repos.length ? repos : undefined },
        ),
      )

      mkdirSync(resolve(DIST, 'project'), { recursive: true })
      for (const project of projects) {
        const { repo, readme } = project
        // project/<name>.html is served by Cloudflare Pages at /project/<name> (no trailing slash)
        writeFileSync(
          resolve(DIST, 'project', `${repo.name}.html`),
          page(
            template,
            head({
              title: projectTitle(repo.name, readme),
              description: projectDescription(repo, readme),
              url: projectUrl(repo.name),
              image: repo.imageUrl,
              jsonLd: [
                jsonLd('project-detail', projectJsonLd(repo, readme)),
                jsonLd('breadcrumbs', projectBreadcrumbJsonLd(repo, readme)),
              ],
            }),
            projectBody(project),
            { builtAt, project },
          ),
        )
      }

      writeFileSync(resolve(DIST, 'sitemap.xml'), sitemap(projects))
      console.log(
        `\n✓  prerender — homepage + ${projects.length} project pages, sitemap.xml written to dist/\n`,
      )
    },
  }
}
