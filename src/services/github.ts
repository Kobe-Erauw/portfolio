import {
  GITHUB_USER,
  isVisibleRepository,
  processRepository,
  sortRepositories,
  type Repository,
} from '../utils/projects'

export type { Repository }

export async function fetchRepositories(): Promise<Repository[]> {
  const response = await fetch(`/api/github/users/${GITHUB_USER}/repos?per_page=100`)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }
  const repos: Repository[] = await response.json()

  return sortRepositories(repos.filter(isVisibleRepository).map(processRepository))
}

// Both functions return null only when GitHub says the README/repo doesn't exist.
// Other failures throw, so the query keeps its current (e.g. prerendered) data
// instead of replacing it with "no README".
export async function fetchReadme(repoName: string): Promise<string | null> {
  const response = await fetch(`/api/github/repos/${GITHUB_USER}/${repoName}/readme`, {
    headers: {
      Accept: 'application/vnd.github.raw',
    },
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`)
  return await response.text()
}

export async function fetchRepository(repoName: string): Promise<Repository | null> {
  const response = await fetch(`/api/github/repos/${GITHUB_USER}/${repoName}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`)
  return processRepository(await response.json())
}
