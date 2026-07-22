export {
  pastProjectCategories as bespokeCategories,
  pastProjectsCatalog as bespokeCreationsCatalog,
  getVisibleGalleryProjects,
  getPastProjectBySlug as getBespokeCreationBySlug,
  GALLERY_CATEGORY_IDS,
  normalizeGalleryCategoryId,
  localizeGalleryProject,
} from './pastProjects'

import { getVisibleGalleryProjects } from './pastProjects'

/** @deprecated Use getVisibleGalleryProjects */
export function getBespokeCreations(locale = 'en') {
  return getVisibleGalleryProjects(locale)
}
