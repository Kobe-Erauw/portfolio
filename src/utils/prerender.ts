/**
 * Reads the data the prerender build step embeds in each generated page
 * (see build/prerender.ts), so the app can render immediately without
 * waiting for the GitHub API and without replacing the static HTML by a spinner.
 */
import { PRERENDER_DATA_ID, type PrerenderData } from './projects'

let cache: PrerenderData | null | undefined

export function getPrerenderData(): PrerenderData | null {
  if (cache !== undefined) return cache
  try {
    const text = document.getElementById(PRERENDER_DATA_ID)?.textContent
    cache = text ? (JSON.parse(text) as PrerenderData) : null
  } catch {
    cache = null
  }
  return cache
}
