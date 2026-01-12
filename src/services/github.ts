export interface Repository {
  id: number
  name: string
  description?: string
  html_url: string
  stargazers_count: number
  language?: string
  updated_at: string
  default_branch?: string
}

export async function fetchRepositories(): Promise<Repository[]> {
  const response = await fetch(`https://api.github.com/users/kobe-erauw/repos?sort=updated&per_page=100`)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }
  return response.json()
}

export async function fetchReadme(repoName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/kobe-erauw/${repoName}/readme`, {
      headers: {
        Accept: 'application/vnd.github.raw',
      },
    })
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`GitHub API error: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    console.error('Failed to fetch readme:', error)
    return null
  }
}

export async function fetchRepository(repoName: string): Promise<Repository | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/kobe-erauw/${repoName}`)
		if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch repo details:', error)
    return null
  }
}
