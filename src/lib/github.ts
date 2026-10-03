/**
 * Loads the projects shown on the site from GitHub. This only runs during the
 * build: the finished pages contain everything, visitors never call GitHub.
 *
 * Which repos are shown is controlled from the GitHub description:
 *   "[hidden]"          → not shown on the site
 *   "[image: shot.png]" → preview image, loaded from the repo's assets/ folder
 */
import { Lexer } from 'marked'
import { GITHUB_USER } from './site'

export interface Project {
  /** Repo name, also used in the URL: /project/<name> */
  name: string
  /** Readable name: the README's "# heading", or the repo name made readable */
  displayName: string
  /** GitHub description without the [image: …] tag; '' when empty */
  description: string
  language: string | null
  stars: number
  githubUrl: string
  imageUrl?: string
  createdAt: string
  pushedAt: string
  branch: string
  /** README as markdown, null when the repo has none */
  readme: string | null
}

interface GithubRepo {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
  created_at: string
  pushed_at: string
  default_branch: string
}

const IMAGE_TAG = /\[image:\s*(.*?)\s*\]/

let cache: Promise<Project[]> | undefined

/** All visible projects, most stars first. Fetched once per build. */
export function getProjects(): Promise<Project[]> {
  cache ??= loadProjects().catch((err) => {
    throw new Error(
      `Could not load projects from GitHub: ${err.message}. ` +
        'If this is a rate limit, set the GITHUB_TOKEN environment variable for the build.',
    )
  })
  return cache
}

async function loadProjects(): Promise<Project[]> {
  const res = await request(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`)
  if (!res.ok) throw new Error(`GitHub API responded with ${res.status} for the repo list`)
  const repos = (await res.json()) as GithubRepo[]

  const projects = await Promise.all(
    repos.filter((repo) => !repo.description?.includes('[hidden]')).map(toProject),
  )
  return projects.sort((a, b) => b.stars - a.stars || Number(!!b.imageUrl) - Number(!!a.imageUrl))
}

async function toProject(repo: GithubRepo): Promise<Project> {
  const branch = repo.default_branch || 'main'
  const image = repo.description?.match(IMAGE_TAG)?.[1]
  const readme = await fetchReadme(repo.name, branch)

  return {
    name: repo.name,
    displayName: readmeHeading(readme) ?? prettify(repo.name),
    description: (repo.description ?? '').replace(IMAGE_TAG, '').trim(),
    language: repo.language,
    stars: repo.stargazers_count,
    githubUrl: repo.html_url,
    imageUrl: image
      ? `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${branch}/assets/${image}`
      : undefined,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    branch,
    readme,
  }
}

async function fetchReadme(repoName: string, branch: string): Promise<string | null> {
  // raw.githubusercontent.com doesn't count towards the API rate limit, so try README.md there first
  const raw = await request(
    `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/${branch}/README.md`,
  )
  if (raw.ok) return raw.text()

  // Other file names (readme.md, README.rst, …): the API finds those for us
  const api = await request(
    `https://api.github.com/repos/${GITHUB_USER}/${repoName}/readme`,
    'application/vnd.github.raw',
  )
  if (api.status === 404) return null
  if (!api.ok) throw new Error(`GitHub API responded with ${api.status} for ${repoName}/readme`)
  return api.text()
}

/** GET with the GitHub token (if set) and up to 3 attempts for temporary errors. */
async function request(url: string, accept = 'application/vnd.github+json'): Promise<Response> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'User-Agent': `${GITHUB_USER}-portfolio`,
    Accept: accept,
  }
  if (token && url.startsWith('https://api.github.com/')) headers.Authorization = `Bearer ${token}`

  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers })
      if (res.ok || res.status === 404 || attempt === 3) return res
    } catch (err) {
      if (attempt === 3) throw err
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
  }
}

/** "retro-pong" → "Retro Pong", "AI_chatbot" → "AI Chatbot" */
function prettify(repoName: string): string {
  return repoName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => (word === word.toLowerCase() ? word[0]!.toUpperCase() + word.slice(1) : word))
    .join(' ')
}

/** The README's first "# heading" as plain text (no emoji, links or markup). */
function readmeHeading(readme: string | null): string | null {
  if (!readme) return null
  const heading = new Lexer().lex(readme).find((t) => t.type === 'heading' && t.depth === 1)
  if (!heading || heading.type !== 'heading') return null

  const text = heading.text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → their text
    .replace(/<[^>]+>/g, '') // inline HTML
    .replace(/[*_`~]/g, '') // bold, italic, code
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '') // emoji
    .replace(/\s+/g, ' ')
    .trim()

  return text.length >= 2 && text.length <= 70 ? text : null
}
