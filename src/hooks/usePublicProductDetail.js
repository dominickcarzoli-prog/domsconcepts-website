import { useEffect, useState } from 'react'
import { fetchEtsyProductBySlug, USE_ETSY_CATALOGUE } from '../data/etsyProducts'
import {
  getProductBySlugOrId,
  isPublished,
  products,
} from '../data/products'

/**
 * Resolve a product detail page by URL slug or legacy id.
 * Uses /api/products/:slug when the Etsy catalogue flag is on.
 */
export function usePublicProductDetail(identifier) {
  const hardcoded = identifier ? getProductBySlugOrId(identifier, products) : undefined
  const [product, setProduct] = useState(
    hardcoded && isPublished(hardcoded) ? hardcoded : undefined,
  )
  const [loading, setLoading] = useState(Boolean(USE_ETSY_CATALOGUE && identifier))
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!identifier) {
      setProduct(undefined)
      setLoading(false)
      setNotFound(true)
      return undefined
    }

    let cancelled = false

    async function load() {
      setLoading(USE_ETSY_CATALOGUE)
      setNotFound(false)

      const resolved = await fetchEtsyProductBySlug(identifier, products)

      if (cancelled) return

      if (resolved && isPublished(resolved)) {
        setProduct(resolved)
        setNotFound(false)
      } else {
        const fallback = getProductBySlugOrId(identifier, products)
        if (fallback && isPublished(fallback)) {
          setProduct(fallback)
          setNotFound(false)
        } else {
          setProduct(undefined)
          setNotFound(true)
        }
      }

      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [identifier])

  return { product, loading, notFound }
}
