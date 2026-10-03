/**
 * Content of the "About me" page (/about). Edit the texts here; the page layout
 * lives in src/pages/about.astro. The same data feeds the structured data
 * (JSON-LD) that tells Google who you are.
 */
import { AUTHOR, GITHUB_URL, LINKEDIN_URL, SITE_URL } from './site'

export const ABOUT_TITLE = `About me – ${AUTHOR}`
export const ABOUT_DESCRIPTION =
  'Kobe Erauw is an AI Engineer at SOFICO and a Software & AI Development graduate from Odisee Technology Campus Ghent, Belgium.'

export const LOCATION = 'Ghent, Belgium'

export const INTRO_PARAGRAPHS = [
  "Hi, I'm Kobe: an AI Engineer at SOFICO, based in Ghent, Belgium.",
  'I graduated in 2026 in Electronics-ICT with a specialisation in Software & AI Development at Odisee Technology Campus Ghent. I’m passionate about AI engineering, fullstack development and building smart systems.',
]

export interface Experience {
  role: string
  company: string
  period: string
  description?: string
}

/** Most recent first */
export const EXPERIENCE: Experience[] = [
  {
    role: 'AI Engineer',
    company: 'SOFICO',
    period: 'Oct 2026 – present',
  },
  {
    role: 'Internship',
    company: 'SOFICO',
    period: '2026 · 10 weeks',
    description:
      'Built a synthetic test data generator: an internal developer tool for generating test data.',
  },
]

export const EDUCATION = {
  degree: 'Bachelor in Electronics-ICT',
  specialisation: 'Software & AI Development',
  school: 'Odisee, Technology Campus Ghent',
  period: 'Graduated 2026, with distinction',
}

export const SKILLS = ['Python', 'Java', 'Vue.js', 'AI engineering']

export const LANGUAGES = [
  { name: 'Dutch', level: 'Native' },
  { name: 'English', level: 'Professional' },
]

export const HOBBIES = 'Outside of work you’ll find me playing table tennis and padel.'

/** Who this site is about, for Google. Used on the homepage and the about page. */
export const PERSON_SCHEMA = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: AUTHOR,
  url: `${SITE_URL}/`,
  jobTitle: 'AI Engineer',
  description: ABOUT_DESCRIPTION,
  worksFor: { '@type': 'Organization', name: 'SOFICO' },
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Odisee',
    address: { '@type': 'PostalAddress', addressLocality: 'Ghent', addressCountry: 'BE' },
  },
  homeLocation: {
    '@type': 'Place',
    address: { '@type': 'PostalAddress', addressLocality: 'Ghent', addressCountry: 'BE' },
  },
  knowsAbout: [...SKILLS, 'Software Engineering', 'Fullstack Development'],
  knowsLanguage: ['nl', 'en'],
  sameAs: [GITHUB_URL, LINKEDIN_URL],
}
