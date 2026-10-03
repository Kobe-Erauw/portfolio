/**
 * Project data helpers shared by the Vue app (browser) and the prerender
 * build step (Node). Keep this file free of DOM and Vite-specific APIs so
 * both sides produce exactly the same titles, descriptions and JSON-LD.
 */
import { Lexer } from 'marked'

export const SITE_URL = 'https://kobeerauw.com'
export const GITHUB_USER = 'kobe-erauw'
export const AUTHOR_NAME = 'Kobe Erauw'

export const HOME_TITLE = 'Kobe Erauw – Software & AI Developer'
export const HOME_INTRO =
  'Software & AI student at Odisee Ghent. Passionate about AI engineering, fullstack development and building smart systems.'
export const HOME_DESCRIPTION =
  'Kobe Erauw is a Software & AI student at Odisee Ghent, passionate about AI engineering, fullstack development, and building smart systems. Browse my projects.'

export interface Repository {
  id: number
  name: string
  description?: string | null
  html_url: string
  stargazers_count: number
  language?: string | null
  updated_at: string
  pushed_at: string
  created_at: string
  default_branch?: string
  imageUrl?: string
}

/**
 * Data that build/prerender.ts embeds in every generated page as
 * <script type="application/json" id="prerender-data">.
 */
export const PRERENDER_DATA_ID = 'prerender-data'

export interface PrerenderData {
  /** Build time in ms, used as the age of the embedded data. */
  builtAt: number
  repos?: Repository[]
  project?: { repo: Repository; readme: string | null }
}

/** Keeps only the fields the site uses (GitHub returns ~80 per repo). */
export function pickRepository(repo: Repository): Repository {
  return {
    id: repo.id,
    name: repo.name,
    description: repo.description,
    html_url: repo.html_url,
    stargazers_count: repo.stargazers_count,
    language: repo.language,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    created_at: repo.created_at,
    default_branch: repo.default_branch,
    imageUrl: repo.imageUrl,
  }
}

const IMAGE_TAG = /\[image:\s*(.*?)\s*\]/

/** Repos whose GitHub description contains "[hidden]" are not shown on the site. */
export function isVisibleRepository(repo: Repository): boolean {
  return !repo.description?.includes('[hidden]')
}

/**
 * Strips the "[image: file.png]" tag from the GitHub description and turns it
 * into an image URL pointing at the repo's assets/ folder.
 */
export function processRepository(repo: Repository): Repository {
  const description = repo.description ?? ''
  const match = description.match(IMAGE_TAG)
  if (!match) return repo

  const branch = repo.default_branch || 'main'
  return {
    ...repo,
    description: description.replace(IMAGE_TAG, '').trim(),
    imageUrl: `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${branch}/assets/${match[1]}`,
  }
}

/** Most stars first, then projects with a preview image. */
export function sortRepositories(repos: Repository[]): Repository[] {
  return [...repos].sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count
    }
    return (b.imageUrl ? 1 : 0) - (a.imageUrl ? 1 : 0)
  })
}

export function projectPath(repoName: string): string {
  return `/project/${repoName}`
}

export function projectUrl(repoName: string): string {
  return `${SITE_URL}${projectPath(repoName)}`
}

/** "retro-pong" → "Retro Pong", "AI_chatbot" → "AI Chatbot" */
export function prettifyRepoName(repoName: string): string {
  return repoName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => (word === word.toLowerCase() ? word[0]!.toUpperCase() + word.slice(1) : word))
    .join(' ')
}

/** First "# Heading" of the README as plain text, without emoji or markup. */
export function readmeHeading(readme: string | null | undefined): string | null {
  if (!readme) return null

  const heading = new Lexer().lex(readme).find((t) => t.type === 'heading' && t.depth === 1)
  if (!heading || heading.type !== 'heading') return null

  const text = heading.text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → link text
    .replace(/<[^>]+>/g, '') // inline HTML
    .replace(/[*_`~]/g, '') // emphasis / code
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '') // emoji
    .replace(/\s+/g, ' ')
    .trim()

  return text.length >= 2 && text.length <= 70 ? text : null
}

/** Human-readable project name: README heading if it has one, else the repo name. */
export function projectDisplayName(repoName: string, readme?: string | null): string {
  return readmeHeading(readme) ?? prettifyRepoName(repoName)
}

export function projectTitle(repoName: string, readme?: string | null): string {
  return `${projectDisplayName(repoName, readme)} – ${AUTHOR_NAME}`
}

export function projectDescription(repo: Repository, readme?: string | null): string {
  return repo.description
    ? `${repo.description.replace(/[.\s]+$/, '')} – a project by ${AUTHOR_NAME}.`
    : `${projectDisplayName(repo.name, readme)} – a project by ${AUTHOR_NAME}, Software & AI developer from Ghent.`
}

const authorLd = {
  '@type': 'Person',
  name: AUTHOR_NAME,
  url: SITE_URL,
  sameAs: [`https://github.com/${GITHUB_USER}`, 'https://www.linkedin.com/in/kobe-erauw'],
}

export function projectsListJsonLd(repos: Repository[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${AUTHOR_NAME}'s Projects`,
    description: `A collection of software and AI projects by ${AUTHOR_NAME}.`,
    url: `${SITE_URL}/`,
    numberOfItems: repos.length,
    itemListElement: repos.map((repo, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: projectUrl(repo.name),
      name: prettifyRepoName(repo.name),
    })),
  }
}

export function projectJsonLd(repo: Repository, readme?: string | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: projectDisplayName(repo.name, readme),
    description: repo.description || undefined,
    url: projectUrl(repo.name),
    image: repo.imageUrl || undefined,
    codeRepository: repo.html_url,
    programmingLanguage: repo.language || undefined,
    dateCreated: repo.created_at,
    dateModified: repo.pushed_at,
    author: authorLd,
  }
}

export function projectBreadcrumbJsonLd(repo: Repository, readme?: string | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Projects', item: `${SITE_URL}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: projectDisplayName(repo.name, readme),
        item: projectUrl(repo.name),
      },
    ],
  }
}
