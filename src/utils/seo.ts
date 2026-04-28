/**
 * SEO utility functions for dynamically managing meta tags and JSON-LD structured data.
 * Used by view components to update page-specific SEO on navigation.
 */

const BASE_URL = 'https://kobeerauw.com'
const DEFAULT_TITLE = 'Kobe Erauw – Software & AI Developer'
const DEFAULT_DESCRIPTION =
  'Kobe Erauw is a Software & AI student at Odisee Ghent, passionate about AI engineering, fullstack development, and building smart systems. Browse my projects.'

/** Update the document title */
export function setTitle(title: string) {
  document.title = title
}

/** Reset the document title to the site default */
export function resetTitle() {
  document.title = DEFAULT_TITLE
}

/** Set or update a <meta name="..."> tag */
export function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

/** Reset the meta description to the site default */
export function resetMetaDescription() {
  setMetaName('description', DEFAULT_DESCRIPTION)
}

/** Set or update a <meta property="..."> (Open Graph) tag */
export function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Set or update the <link rel="canonical"> tag */
export function setCanonical(path: string) {
  const href = path.startsWith('http') ? path : `${BASE_URL}${path}`
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/** Inject a JSON-LD <script> block with a given ID (replaces existing if present) */
export function injectJsonLd(id: string, data: object) {
  removeJsonLd(id)
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = `ld-${id}`
  script.textContent = JSON.stringify(data, null, 2)
  document.head.appendChild(script)
}

/** Remove a JSON-LD <script> block by ID */
export function removeJsonLd(id: string) {
  document.getElementById(`ld-${id}`)?.remove()
}
