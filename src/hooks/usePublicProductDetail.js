import { useEffect, useState } from 'react'
import { fetchEtsyProductBySlug, USE_ETSY_CATALOGUE } from '../data/etsyProducts'
import {
  getProductBySlugOrId,
  isPublished,
  products,
} from '../data/products'
import { useLocale } from '../i18n/LocaleProvider.jsx'

/**
 * Resolve a product detail page by URL slug or legacy id.
 * Uses /api/products/:slug when the Etsy catalogue flag is on.
 *
 * States: loading | found | notFound | error
 * Never assumes a product exists; missing translation must not wipe a found product.
 */
export function usePublicProductDetail(identifier) {
  const { locale } = useLocale()
  const hardcoded = identifier ? getProductBySlugOrId(identifier, products) : undefined
  const [product, setProduct] = useState(
    hardcoded && isPublished(hardcoded) ? hardcoded : undefined,
  )
  const [loading, setLoading] = useState(Boolean(USE_ETSY_CATALOGUE && identifier))
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!identifier) {
      setProduct(undefined)
      setLoading(false)
      setNotFound(true)
      setError(null)
      return undefined
    }

    let cancelled = false

    async function load() {
      setLoading(Boolean(USE_ETSY_CATALOGUE))
      setNotFound(false)
      setError(null)

      try {
        const resolved = await fetchEtsyProductBySlug(identifier, products, { locale })

        if (cancelled) return

        if (resolved && isPublished(resolved)) {
          setProduct(resolved)
          setNotFound(false)
          setError(null)
        } else {
          const fallback = getProductBySlugOrId(identifier, products)
          if (fallback && isPublished(fallback)) {
            setProduct(fallback)
            setNotFound(false)
            setError(null)
          } else {
            setProduct(undefined)
            setNotFound(true)
            setError(null)
          }
        }
      } catch (loadError) {
        if (cancelled) return
        const fallback = getProductBySlugOrId(identifier, products)
        if (fallback && isPublished(fallback)) {
          setProduct(fallback)
          setNotFound(false)
          setError(null)
        } else {
          setProduct(undefined)
          setNotFound(false)
          setError(loadError instanceof Error ? loadError : new Error('load_failed'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [identifier, locale])

  return { product, loading, notFound, error }
}
