/**
 * Turns a project's README into safe HTML for its project page (at build time).
 */
import { Marked, type Token } from 'marked'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { GITHUB_USER } from './site'

const purify = createDOMPurify(new JSDOM('').window)

// http:, mailto:, //cdn…, #anchor: leave these alone
const ABSOLUTE_URL = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function renderReadme(markdown: string, repoName: string, branch: string): string {
  const repoPath = (href: string) => href.replace(/^\.?\//, '')
  // Relative paths in a README point into the repo, not to this site:
  // images load from raw.githubusercontent.com, links open the file on GitHub.
  const rawUrl = (href: string) =>
    ABSOLUTE_URL.test(href)
      ? href
      : `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/${branch}/${repoPath(href)}`
  const blobUrl = (href: string) =>
    ABSOLUTE_URL.test(href)
      ? href
      : `https://github.com/${GITHUB_USER}/${repoName}/blob/${branch}/${repoPath(href)}`

  const marked = new Marked({
    async: false,
    walkTokens(token: Token) {
      if (token.type === 'image') token.href = rawUrl(token.href)
      if (token.type === 'link') token.href = blobUrl(token.href)
      // HTML written directly in the README, e.g. <img src="assets/demo.png">
      if (token.type === 'html') {
        token.text = token.text
          .replace(
            /(<img\b[^>]*?\ssrc=")([^"]+)"/gi,
            (_: string, before: string, src: string) => `${before}${rawUrl(src)}"`,
          )
          .replace(
            /(<a\b[^>]*?\shref=")([^"]+)"/gi,
            (_: string, before: string, href: string) => `${before}${blobUrl(href)}"`,
          )
      }
    },
    renderer: {
      image({ href, title, text }) {
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : ''
        return `<img src="${escapeAttr(href)}" alt="${escapeAttr(text)}"${titleAttr} loading="lazy" class="img-fluid">`
      },
    },
  })

  // Strip scripts, event handlers etc. that a README could contain
  return purify.sanitize(marked.parse(markdown) as string)
}
