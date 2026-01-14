export interface Repository {
  id: number
  name: string
  description?: string
  html_url: string
  stargazers_count: number
  language?: string
  updated_at: string
  pushed_at: string
  created_at: string
  default_branch?: string
  imageUrl?: string
}

export async function fetchRepositories(): Promise<Repository[]> {
  const response = await fetch(`https://api.github.com/users/kobe-erauw/repos?per_page=100`)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }
  const repos: Repository[] = await response.json()

  const processedRepos = repos
    .filter((repo) => !repo.description?.includes('[hidden]'))
    .map((repo) => {
      const description = repo.description ?? ''
    const imageRegex = /\[image:\s*(.*?)\s*\]/
    const match = description.match(imageRegex)

    if (match) {
      const imageName = match[0].replace('[image:', '').replace(']', '').trim()
      repo.description = description.replace(imageRegex, '').trim()
      repo.imageUrl = `https://raw.githubusercontent.com/kobe-erauw/${repo.name}/main/assets/${imageName}`
    }
    return repo
  })

  return processedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count)
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
