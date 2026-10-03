/**
 * README → HTML rendering shared by the Vue app and the prerender build step.
 * Returns UNSANITIZED html: callers must run it through DOMPurify.
 */
import { Marked, type Token } from 'marked'
import { GITHUB_USER } from './projects'

const ABSOLUTE_URL = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function renderReadme(markdown: string, repoName: string, branch = 'main'): string {
  const repoPath = (href: string) => href.replace(/^\.?\//, '')
  // Images load from raw.githubusercontent, links open the file on GitHub, so
  // relative paths in READMEs don't turn into broken URLs on this site.
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
      // Raw HTML in READMEs, e.g. <img src="assets/demo.png">
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

  return marked.parse(markdown) as string
}
