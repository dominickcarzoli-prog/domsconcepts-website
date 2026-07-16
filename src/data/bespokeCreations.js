export {
  pastProjectCategories as bespokeCategories,
  pastProjectsCatalog as bespokeCreationsCatalog,
  getVisibleGalleryProjects,
  getPastProjectBySlug as getBespokeCreationBySlug,
} from './pastProjects'

import { getVisibleGalleryProjects } from './pastProjects'

/** @deprecated Use getVisibleGalleryProjects */
export function getBespokeCreations() {
  return getVisibleGalleryProjects()
}
