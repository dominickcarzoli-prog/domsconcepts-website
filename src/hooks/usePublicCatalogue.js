import { useEffect, useState } from 'react'
import { resolvePublicProducts, USE_ETSY_CATALOGUE } from '../data/etsyProducts'
import { getShopProducts, products, sortProducts } from '../data/products'

const FALLBACK_PRODUCTS = getShopProducts(products)

/**
 * Load the public shop catalogue (Etsy API when flagged, else hardcoded).
 * Never returns an empty list — falls back to hardcoded shop products.
 */
export function usePublicCatalogue() {
  const [catalogueProducts, setCatalogueProducts] = useState(FALLBACK_PRODUCTS)
  const [ready, setReady] = useState(!USE_ETSY_CATALOGUE)
  const [source, setSource] = useState(USE_ETSY_CATALOGUE ? 'loading' : 'fallback')

  useEffect(() => {
    if (!USE_ETSY_CATALOGUE) {
      setCatalogueProducts(FALLBACK_PRODUCTS)
      setSource('fallback')
      setReady(true)
      return undefined
    }

    let cancelled = false

    resolvePublicProducts(FALLBACK_PRODUCTS).then((resolved) => {
      if (cancelled) return

      const usedEtsy =
        Array.isArray(resolved) &&
        resolved.length > 0 &&
        resolved.some((product) => product.source === 'etsy')

      setCatalogueProducts(
        sortProducts(resolved.length > 0 ? resolved : FALLBACK_PRODUCTS),
      )
      setSource(usedEtsy ? 'etsy' : 'fallback')
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { products: catalogueProducts, ready, source }
}
