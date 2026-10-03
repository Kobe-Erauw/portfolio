/**
 * Profile photo. To change it, replace src/assets/kobe-erauw.jpg (square works best).
 * Astro converts it to small, optimised versions during the build.
 */
import { getImage } from 'astro:assets'
import photo from '../assets/kobe-erauw.jpg'
import { AUTHOR, SITE_URL } from './site'

export { photo }
export const PHOTO_ALT = `Photo of ${AUTHOR}`

/** Absolute URL of a JPEG version, for link previews (LinkedIn, …) and Google. */
export async function getPhotoUrl(): Promise<string> {
  const image = await getImage({ src: photo, width: 800, height: 800, format: 'jpg' })
  return new URL(image.src, SITE_URL).href
}
