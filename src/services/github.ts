export interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  updated_at: string
}

export async function fetchRepositories(): Promise<Repository[]> {
  const response = await fetch(`https://api.github.com/users/kobe-erauw/repos?sort=updated&per_page=100`)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }
  return response.json()
}
