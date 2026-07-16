import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import {
  boardCarePricing,
  boardCareProducts,
  budgetRanges,
  careGuidePoints,
  customOrderSteps,
  customProductTypes,
  engravingOptions,
  faqItems,
  getBoardCareAddonLabel,
  getBoardCareButtonAction,
  homepageCarouselSlides,
  legalPages,
  makerAboutImagePath,
  navItems,
  pageSeo,
  partnerItems,
  premiumReviews,
  resolveBoardCareAddon,
  shippingOptions,
  signaturePieces,
  woodPreferences,
  workshopAboutImagePath,
} from './siteData'
import { getProductSocialProof, reviewTrustPoints, reviews } from './data/reviews'
import { instagramVideos } from './data/instagramVideos'
import {
  bespokeCategories,
  getBespokeCreationBySlug,
  getHomepagePastProjects,
  getVisibleGalleryProjects,
} from './data/bespokeCreations'
import {
  CUSTOM_ORDER_FORM_ANCHOR,
  ETSY_SHOP_URL,
  getHomepageFeaturedProducts,
  getProductEtsyHref,
  getProductPrimaryAction,
  getProductRealImages,
  getProductSecondaryAction,
  getShopCollections,
  productIdRedirects,
  products,
  shopProducts,
} from './data/products'

const contactEmail = 'hello@domsconcepts.com'
const instagramHandle = '@doms_concepts'
const instagramUrl = 'https://instagram.com/doms_concepts'
const placeholderInstagramReelUrl = 'PASTE_INSTAGRAM_REEL_URL_HERE'
const etsyShopName = 'DomsConcepts'
const etsyShopUrl = ETSY_SHOP_URL
const footerLinks = [
  { label: 'Shop', path: '/available-pieces' },
  { label: 'Custom Orders', path: '/custom-orders' },
  { label: 'About', path: '/about' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Contact', path: '/contact' },
]
const productBadgeClassesLuxury = {
  Available: 'border-emerald-400/25 bg-emerald-950/40 text-emerald-200',
  'Made to Order': 'border-sky-400/25 bg-sky-950/40 text-sky-200',
  'One-of-One': 'border-amber-300/30 bg-amber-950/40 text-amber-200',
  Sold: 'border-stone-400/30 bg-stone-800/60 text-stone-300',
}
const productBadgeLabels = {
  Available: 'AVAILABLE',
  'Made to Order': 'MADE TO ORDER',
  'One-of-One': 'ONE-OF-ONE',
  Sold: 'SOLD',
}
const icoNumber = '14010615'
const logoImagePath = '/images/doms-concepts-logo-gold.png'
const logoFallbackImagePath = '/images/doms-concepts-logo.png'
const goldButtonClassName = 'btn-gold gold-button px-6 py-3 text-sm text-[#111111]'
const goldButtonClassNameCompact = 'btn-gold gold-button px-4 py-2 text-xs text-[#111111]'
const outlineButtonClassName = 'btn-outline px-6 py-3 text-sm'
const outlineButtonLightClassName = 'btn-outline-light px-6 py-3 text-sm'
const goldChipActiveClassName =
  'chip-gold-active rounded-full border px-3 py-1.5 text-xs font-medium'

const SITE_URL = 'https://domsconcepts.com'
const DEFAULT_OG_IMAGE = '/images/carousel/premium-cutting-boards.jpg'

function upsertMeta(selector, attributes) {
  let element = document.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function upsertLink(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }

  element.href = href
}

function PageMeta({ title, description, ogImage = DEFAULT_OG_IMAGE, canonicalPath }) {
  const location = useLocation()

  useEffect(() => {
    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description', content: description })

    const path = canonicalPath ?? location.pathname
    const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`
    const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`

    upsertLink('canonical', canonicalUrl)
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: "Dom's Concepts",
    })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })
  }, [canonicalPath, description, location.pathname, ogImage, title])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteLayout />
    </BrowserRouter>
  )
}

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return null
}

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0b09] text-stone-100">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d0b09]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3.5 lg:gap-4">
            <BrandMark />
            <div className="min-w-0 pt-0.5">
              <p className="truncate font-display text-[1.05rem] leading-none tracking-[0.01em] text-stone-100 sm:text-[1.15rem] lg:text-[1.28rem]">
                Dom&apos;s Concepts
              </p>
              <p className="mt-1 truncate text-[10px] uppercase tracking-[0.24em] text-stone-400 sm:text-[11px]">
                Handmade in Prague
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-stone-100 transition hover:border-amber-200/40 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>
        </div>

        {menuOpen ? (
          <nav className="border-t border-white/10 px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <NavItem key={item.path} item={item} mobile />
              ))}
            </div>
          </nav>
        ) : null}
      </div>

      <main className="pt-24">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="available-pieces" element={<AvailablePiecesPage />} />
          <Route path="available-pieces/:productId" element={<ProductDetailPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="bespoke-creations/:projectSlug" element={<BespokeCreationDetailPage />} />
          <Route path="custom-orders" element={<CustomOrdersPage />} />
          <Route path="care-guide" element={<CareGuidePage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          {legalPages.map((page) => (
            <Route
              key={page.slug}
              path={page.path.replace(/^\//, '')}
              element={<LegalDocumentPage slug={page.slug} />}
            />
          ))}
        </Routes>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0807]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_1fr]">
            <div className="space-y-4">
              <p className="font-display text-2xl text-stone-100">Dom&apos;s Concepts</p>
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
                Handmade in Prague
              </p>
              <a
                className="inline-block text-stone-300 transition hover:text-amber-200"
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </a>
            </div>

            <div className="space-y-4 text-sm text-stone-400">
              <p className="font-medium text-stone-200">Links</p>
              <div className="grid gap-3">
                {footerLinks.map((item) => (
                  <Link key={item.path} to={item.path} className="transition hover:text-[var(--color-accent)]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-sm text-stone-400">
              <p className="font-medium text-stone-200">Connect</p>
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="block transition hover:text-[var(--color-accent)]">
                Instagram: {instagramHandle}
              </a>
              <a href={etsyShopUrl} target="_blank" rel="noreferrer" className="block transition hover:text-[var(--color-accent)]">
                Etsy: {etsyShopName}
              </a>
              <p>IČO: {icoNumber}</p>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="text-sm text-stone-200">Legal</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
              {legalPages.map((page) => (
                <Link key={page.slug} to={page.path} className="transition hover:text-[var(--color-accent)]">
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const heroCarouselFallbackImagePath = '/images/hero-workshop-board.jpg'
const defaultStaticHeroImage = '/images/carousel/premium-cutting-boards.jpg'
const defaultStaticHeroAlt = 'Kitchen board on counter'

const kitchenBoardHeroSlide = homepageCarouselSlides.find((slide) => slide.id === 'kitchen-board')
const staticHeroImage =
  typeof kitchenBoardHeroSlide?.image === 'string' && kitchenBoardHeroSlide.image.trim()
    ? kitchenBoardHeroSlide.image
    : defaultStaticHeroImage
const staticHeroAlt =
  typeof kitchenBoardHeroSlide?.label === 'string' && kitchenBoardHeroSlide.label.trim()
    ? kitchenBoardHeroSlide.label
    : defaultStaticHeroAlt
const staticHeroFallbackImage =
  typeof kitchenBoardHeroSlide?.fallbackImage === 'string' && kitchenBoardHeroSlide.fallbackImage.trim()
    ? kitchenBoardHeroSlide.fallbackImage
    : heroCarouselFallbackImagePath

function BrandMark() {
  const [logoSrc, setLogoSrc] = useState(logoImagePath)

  return (
    <img
      src={logoSrc}
      alt="Dom's Concepts logo"
      loading="eager"
      onError={() => {
        if (logoSrc !== logoFallbackImagePath) {
          setLogoSrc(logoFallbackImagePath)
        }
      }}
      className="h-auto w-[3.25rem] shrink-0 object-contain sm:w-14 lg:w-[4.5rem]"
    />
  )
}

function NavItem({ item, mobile = false }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          mobile ? 'rounded-2xl px-4 py-3' : 'px-0 py-2',
          'text-sm tracking-wide transition',
          isActive ? 'text-amber-200' : 'text-stone-300 hover:text-stone-100',
          mobile ? 'border border-white/10 bg-white/5 text-stone-100' : '',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  )
}

function PageShell({ eyebrow, title, intro, children }) {
  return (
    <section className="page-shell warm-section w-full scroll-mt-28">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 max-w-3xl space-y-4 sm:space-y-5">
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80">{eyebrow}</p>
          <h1 className="font-display text-[2.2rem] leading-[1.08] text-stone-100 sm:text-[2.9rem] lg:text-[3.5rem]">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-300 sm:text-lg sm:leading-8">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

function HeroCarousel() {
  // Hero carousel disabled for v1 — using static premium hero image.
  const HERO_CAROUSEL_ENABLED = false

  // Carousel images are portfolio/hero images, not product inventory images.
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)

  useEffect(() => {
    if (!HERO_CAROUSEL_ENABLED || isPaused || homepageCarouselSlides.length <= 1) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % homepageCarouselSlides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [isPaused])

  const goToSlide = (index) => {
    setActiveIndex((index + homepageCarouselSlides.length) % homepageCarouselSlides.length)
  }

  const carouselInteractionProps = HERO_CAROUSEL_ENABLED
    ? {
        'aria-roledescription': 'carousel',
        onMouseEnter: () => setIsPaused(true),
        onMouseLeave: () => setIsPaused(false),
        onFocusCapture: () => setIsPaused(true),
        onBlurCapture: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsPaused(false)
          }
        },
        onTouchStart: (event) => setTouchStartX(event.touches[0].clientX),
        onTouchEnd: (event) => {
          if (touchStartX === null) return
          const delta = touchStartX - event.changedTouches[0].clientX
          if (Math.abs(delta) > 48) {
            goToSlide(activeIndex + (delta > 0 ? 1 : -1))
          }
          setTouchStartX(null)
        },
      }
    : {}

  return (
    <section
      className="dark-section relative w-full min-h-[34rem] overflow-hidden sm:min-h-[40rem] lg:min-h-[46rem]"
      aria-label="Dom's Concepts signature woodwork"
      {...carouselInteractionProps}
    >
      <div className="absolute inset-0 bg-[#14100e]">
        {HERO_CAROUSEL_ENABLED ? (
          homepageCarouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={[
                'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0',
              ].join(' ')}
              aria-hidden={index !== activeIndex}
            >
              <HeroCarouselImage
                src={slide.image}
                alt={slide.label}
                fallbackSrc={slide.fallbackImage ?? heroCarouselFallbackImagePath}
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0">
            <HeroCarouselImage
              src={staticHeroImage}
              alt={staticHeroAlt}
              fallbackSrc={staticHeroFallbackImage}
              positionClassName="object-[58%_72%] md:object-[center_62%]"
            />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#14100e]/92 via-[#14100e]/62 to-[#14100e]/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0a09]/88 via-[#14100e]/25 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[34rem] max-w-7xl flex-col justify-end px-4 py-8 sm:min-h-[40rem] sm:px-6 sm:py-12 lg:min-h-[46rem] lg:px-8 lg:py-24">
        <div className="max-w-3xl space-y-4 sm:space-y-6 lg:space-y-7">
          <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
            Dom&apos;s Concepts · Prague workshop
          </p>
          <h1 className="font-display text-[2.45rem] leading-[1.03] text-white sm:text-[3.15rem] lg:text-[4rem]">
            Handmade hardwood pieces, built to be used and seen.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-200 sm:text-lg sm:leading-8">
            From cutting boards and serving pieces to one-of-one custom woodwork, Dom&apos;s
            Concepts creates small-batch hardwood pieces from a Prague workshop.
          </p>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:gap-3">
            <a href="#signature-work" className={`${goldButtonClassName} w-full sm:w-auto`}>
              Explore Signature Work
            </a>
            <a href="#available-now" className={`${outlineButtonLightClassName} w-full sm:w-auto`}>
              Shop Available Pieces
            </a>
          </div>
          <p className="text-xs leading-5 tracking-[0.04em] text-stone-300/90 sm:text-sm sm:leading-6">
            Handmade in Prague · Custom orders available · Etsy checkout for available pieces
          </p>
        </div>

        {HERO_CAROUSEL_ENABLED ? (
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/10 pt-8">
            <div className="flex items-center gap-2">
              {homepageCarouselSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show ${slide.label}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => goToSlide(index)}
                  className={[
                    'h-2 rounded-full transition',
                    index === activeIndex
                      ? 'w-7 bg-amber-200/90'
                      : 'w-2 bg-white/30 hover:bg-white/50',
                  ].join(' ')}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => goToSlide(activeIndex - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:border-amber-200/40 hover:bg-black/55"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => goToSlide(activeIndex + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:border-amber-200/40 hover:bg-black/55"
              >
                →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function HeroCarouselImage({ src, alt, fallbackSrc, positionClassName = 'object-center' }) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImageSrc(src)
    setHasError(false)
  }, [src])

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1511] via-stone-950 to-black" />
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="eager"
      onError={() => {
        if (fallbackSrc && imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc)
          return
        }

        setHasError(true)
      }}
      className={['absolute inset-0 h-full w-full object-cover opacity-75', positionClassName].join(' ')}
    />
  )
}

const SIGNATURE_AUTOPLAY_MS = 4500
const SIGNATURE_TRANSITION_MS = 700

function SignatureWorkCarousel() {
  const touchStartX = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocusPaused, setIsFocusPaused] = useState(false)
  const [isDocumentHidden, setIsDocumentHidden] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateCardsPerView = () => {
      setCardsPerView(desktopQuery.matches ? 2 : 1)
    }

    const updateMotionPreference = () => {
      setPrefersReducedMotion(motionQuery.matches)
    }

    updateCardsPerView()
    updateMotionPreference()
    desktopQuery.addEventListener('change', updateCardsPerView)
    motionQuery.addEventListener('change', updateMotionPreference)

    return () => {
      desktopQuery.removeEventListener('change', updateCardsPerView)
      motionQuery.removeEventListener('change', updateMotionPreference)
    }
  }, [])

  useEffect(() => {
    const handleVisibility = () => setIsDocumentHidden(document.hidden)
    handleVisibility()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const slideCount = Math.ceil(signaturePieces.length / cardsPerView)
  const maxIndex = Math.max(0, slideCount - 1)

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex))
  }, [maxIndex])

  const goToSlide = useCallback(
    (index) => {
      const nextIndex = ((index % slideCount) + slideCount) % slideCount
      setActiveIndex(nextIndex)
    },
    [slideCount],
  )

  const isAutoplayPaused =
    prefersReducedMotion || isHovered || isFocusPaused || isDocumentHidden || slideCount <= 1

  useEffect(() => {
    if (isAutoplayPaused) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount)
    }, SIGNATURE_AUTOPLAY_MS)

    return () => window.clearInterval(timer)
  }, [isAutoplayPaused, slideCount, activeIndex])

  useEffect(() => {
    const nextSlideIndex = (activeIndex + 1) % slideCount
    const start = nextSlideIndex * cardsPerView
    const imagesToPreload = signaturePieces.slice(start, start + cardsPerView)

    imagesToPreload.forEach((piece) => {
      if (!piece.image) return
      const img = new Image()
      img.src = piece.image
    })
  }, [activeIndex, cardsPerView, slideCount])

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - event.changedTouches[0].clientX
    if (Math.abs(delta) > 48) {
      goToSlide(activeIndex + (delta > 0 ? 1 : -1))
    }
    touchStartX.current = null
  }

  const transitionStyle = prefersReducedMotion
    ? { transition: 'none' }
    : { transition: `transform ${SIGNATURE_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` }

  return (
    <div
      className="mt-14"
      aria-roledescription="carousel"
      aria-label="Signature custom work"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocusPaused(false)
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            ...transitionStyle,
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {Array.from({ length: slideCount }).map((_, slideIndex) => {
            const start = slideIndex * cardsPerView
            const pieces = signaturePieces.slice(start, start + cardsPerView)

            return (
              <div
                key={`signature-slide-${slideIndex}`}
                className="grid w-full shrink-0 grid-cols-1 gap-6 lg:grid-cols-2"
                aria-hidden={slideIndex !== activeIndex ? true : undefined}
              >
                {pieces.map((piece) => (
                  <SignaturePieceCard key={piece.id} piece={piece} />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="flex flex-wrap items-center gap-2.5" role="tablist" aria-label="Signature work slides">
          {Array.from({ length: slideCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-label={`Show signature work slide ${index + 1}`}
              aria-selected={index === activeIndex}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goToSlide(index)}
              className={[
                'h-2.5 rounded-full transition-all duration-300',
                index === activeIndex
                  ? 'w-8 bg-amber-200/90 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                  : 'w-2.5 bg-white/25 hover:bg-white/45',
              ].join(' ')}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous signature work"
            onClick={() => goToSlide(activeIndex - 1)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white transition hover:border-amber-200/45 hover:bg-black/60 hover:text-amber-100"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next signature work"
            onClick={() => goToSlide(activeIndex + 1)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white transition hover:border-amber-200/45 hover:bg-black/60 hover:text-amber-100"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

function SignaturePieceImage({ src, alt, objectPosition = 'center center', priority = false }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (!src || hasError) {
    return <div className="signature-image-placeholder h-full w-full" aria-hidden="true" />
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setHasError(true)}
      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
      style={{ objectPosition }}
    />
  )
}

function SignaturePieceCard({ piece }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <Link
        to="/gallery"
        className="aspect-[16/10] block overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200/70"
        aria-label={`View past projects related to ${piece.name}`}
      >
        <SignaturePieceImage
          src={piece.image}
          alt={piece.name}
          objectPosition={piece.objectPosition}
          priority={piece.id === signaturePieces[0]?.id || piece.id === signaturePieces[1]?.id}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-6 sm:gap-4 sm:p-7">
        <div className="space-y-1">
          <h3 className="font-display text-2xl text-white">{piece.name}</h3>
          {piece.subtitle ? (
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/70">
              {piece.subtitle}
            </p>
          ) : null}
        </div>
        <p className="flex-1 text-sm leading-7 text-stone-300 sm:text-base">
          {piece.description}
        </p>
        <Link to={CUSTOM_ORDER_FORM_ANCHOR} className="btn-outline-light self-start px-4 py-2 text-xs">
          Request something similar
        </Link>
      </div>
    </article>
  )
}

function getCardObjectPosition(project) {
  return project.cardObjectPosition ?? 'center center'
}

function getModalObjectPosition(project) {
  return project.modalObjectPosition ?? project.cardObjectPosition ?? 'center center'
}

function PastProjectCardImage({ project, alt, hidePlaceholder = false, className = '' }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [project.image])

  if (!project.image || hasError) {
    if (hidePlaceholder) {
      return null
    }

    return <div className="signature-image-placeholder h-full w-full" aria-hidden="true" />
  }

  return (
    <img
      src={project.image}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      style={{ objectPosition: getCardObjectPosition(project) }}
      className={['past-project-card-image', className].filter(Boolean).join(' ')}
    />
  )
}

function PastProjectModalImage({ project, alt }) {
  const [hasError, setHasError] = useState(false)
  const displayedImage = project.modalImage || project.image

  useEffect(() => {
    setHasError(false)
  }, [displayedImage])

  if (!displayedImage || hasError) {
    return null
  }

  return (
    <img
      src={displayedImage}
      alt={alt}
      onError={() => setHasError(true)}
      style={{
        objectPosition: getModalObjectPosition(project),
      }}
      className="past-project-modal-image"
    />
  )
}

function BespokeCreationCard({ project, hidePlaceholder = false, onSelect }) {
  const categoryLabel = project.category ?? project.categories?.[0] ?? ''

  return (
    <article className="bespoke-card group flex h-full flex-col hover:-translate-y-[3px]">
      <button
        type="button"
        onClick={() => onSelect?.(project)}
        className="block w-full overflow-hidden text-left"
        aria-label={`View ${project.name}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1c1511]">
          <PastProjectCardImage
            project={project}
            alt={project.name}
            hidePlaceholder={hidePlaceholder}
            className="transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/75">
          Completed Project
        </p>
        <button
          type="button"
          onClick={() => onSelect?.(project)}
          className="text-left font-display text-xl leading-snug text-stone-100 transition hover:text-amber-200"
        >
          {project.name}
        </button>
        <p className="text-sm leading-6 text-stone-400">{project.material}</p>
        {categoryLabel ? (
          <p className="mt-auto text-[10px] uppercase tracking-[0.18em] text-stone-500">
            {categoryLabel}
          </p>
        ) : null}
      </div>
    </article>
  )
}

function PastProjectLightbox({ project, projects, currentIndex, onClose, onNavigate }) {
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < projects.length - 1

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowLeft' && hasPrevious) {
        onNavigate(currentIndex - 1)
        return
      }

      if (event.key === 'ArrowRight' && hasNext) {
        onNavigate(currentIndex + 1)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentIndex, hasNext, hasPrevious, onClose, onNavigate])

  if (!project) {
    return null
  }

  const categoryLabel = project.category ?? project.categories?.[0] ?? ''

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/82 p-4 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      onClick={onClose}
    >
      <div
        className="past-project-lightbox relative flex max-h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-2xl border border-[rgba(212,170,86,0.28)] bg-[#14100e] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="past-project-modal-viewport">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project preview"
            className="past-project-lightbox-close"
          >
            ×
          </button>

          {hasPrevious ? (
            <button
              type="button"
              onClick={() => onNavigate(currentIndex - 1)}
              aria-label="Previous project"
              className="past-project-lightbox-nav past-project-lightbox-nav--prev"
            >
              ‹
            </button>
          ) : null}

          <PastProjectModalImage project={project} alt={project.name} />

          {hasNext ? (
            <button
              type="button"
              onClick={() => onNavigate(currentIndex + 1)}
              aria-label="Next project"
              className="past-project-lightbox-nav past-project-lightbox-nav--next"
            >
              ›
            </button>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-white/10 px-5 py-4 sm:px-6 sm:py-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/75">
            Completed Project
          </p>
          <h2 className="font-display text-2xl text-stone-100 sm:text-3xl">{project.name}</h2>
          <p className="text-sm leading-7 text-stone-300 sm:text-base">{project.material}</p>
          {categoryLabel ? (
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">{categoryLabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PastProjectsCredibilityRow() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.22em] text-stone-500">
      <span>Handmade in Prague</span>
      <span className="hidden text-amber-200/30 sm:inline" aria-hidden="true">
        |
      </span>
      <span>Built since 2016</span>
      <span className="hidden text-amber-200/30 sm:inline" aria-hidden="true">
        |
      </span>
      <span>Furniture and serving pieces</span>
      <span className="hidden text-amber-200/30 sm:inline" aria-hidden="true">
        |
      </span>
      <span>One-of-one projects</span>
    </div>
  )
}

function PastProjectsGrid({
  projects,
  showFilters = false,
  featuredLayout = false,
  hidePlaceholder = true,
  enableLightbox = false,
}) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)

  const filteredProjects =
    !showFilters || activeCategory === 'All'
      ? projects
      : projects.filter((project) => project.categories.includes(activeCategory))

  const handleSelect = useCallback(
    (project) => {
      if (enableLightbox) {
        setSelectedProject(project)
      }
    },
    [enableLightbox],
  )

  const handleCloseLightbox = useCallback(() => {
    setSelectedProject(null)
  }, [])

  const handleNavigateLightbox = useCallback(
    (index) => {
      const nextProject = filteredProjects[index]
      if (nextProject) {
        setSelectedProject(nextProject)
      }
    },
    [filteredProjects],
  )

  const selectedProjectIndex = selectedProject
    ? filteredProjects.findIndex((project) => project.id === selectedProject.id)
    : -1

  if (projects.length === 0) {
    return null
  }

  return (
    <>
      {showFilters ? (
        <div className="-mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            {bespokeCategories.map((category) => {
              const isActive = activeCategory === category

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={[
                    'shrink-0',
                    isActive
                      ? goldChipActiveClassName
                      : 'rounded-full border border-[rgba(212,170,86,0.22)] bg-[rgba(24,18,14,0.72)] px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:border-amber-200/40 hover:text-stone-100',
                  ].join(' ')}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div
        className={[
          'grid grid-cols-1 gap-6',
          showFilters ? 'mt-8' : 'mt-0',
          'sm:grid-cols-2 lg:grid-cols-3',
        ].join(' ')}
      >
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className={featuredLayout && project.featured ? 'sm:col-span-2 lg:col-span-2' : ''}
          >
            <BespokeCreationCard
              project={project}
              hidePlaceholder={hidePlaceholder}
              onSelect={enableLightbox ? handleSelect : undefined}
            />
          </div>
        ))}
      </div>

      {enableLightbox && selectedProject && selectedProjectIndex >= 0 ? (
        <PastProjectLightbox
          project={selectedProject}
          projects={filteredProjects}
          currentIndex={selectedProjectIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigateLightbox}
        />
      ) : null}
    </>
  )
}

function PastProjectsTeaser() {
  const teaserProjects = getHomepagePastProjects(6)

  if (teaserProjects.length === 0) {
    return null
  }

  return (
    <section id="past-projects" className="dark-section scroll-mt-28 w-full py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
              PAST PROJECTS
            </p>
            <h2 className="font-display text-4xl text-stone-100 sm:text-[2.75rem]">
              A look back at pieces built over the years.
            </h2>
            <p className="text-base leading-8 text-stone-300">
              Furniture, serving pieces and one-of-one creations handmade by Dom&apos;s Concepts
              since 2016.
            </p>
          </div>
          <PrimaryLink to="/gallery">Explore Past Projects</PrimaryLink>
        </div>

        <PastProjectsGrid projects={teaserProjects} hidePlaceholder enableLightbox />
      </div>
    </section>
  )
}

function BespokeCreationDetailPage() {
  const { projectSlug } = useParams()
  const project = getBespokeCreationBySlug(projectSlug)

  if (!project) {
    return (
      <PageShell
        eyebrow="PAST PROJECTS"
        title="Project not found"
        intro="This completed project may have moved or the link may be incomplete."
      >
        <PrimaryLink to="/gallery">Back to Past Projects</PrimaryLink>
      </PageShell>
    )
  }

  const categoryLabel = project.categories.join(' · ')

  return (
    <>
      <PageMeta
        title={`${project.name} | Past Projects | Dom's Concepts`}
        description={`${project.name} — ${project.material}. A completed commission from Dom's Concepts in Prague.`}
        ogImage={project.image}
        canonicalPath={`/bespoke-creations/${project.slug}`}
      />
      <PageShell
        eyebrow="PAST PROJECTS"
        title={project.name}
        intro={project.material}
      >
        <div className="mb-8">
          <SecondaryLink to="/gallery">Back to Past Projects</SecondaryLink>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1c1511]">
            <PastProjectCardImage project={project} alt={project.name} hidePlaceholder />
          </div>
          <Card luxury>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/75">
              Completed Project
            </p>
            <h2 className="mt-4 font-display text-3xl text-white">{project.name}</h2>
            <p className="mt-4 text-base leading-8 text-stone-300">{project.material}</p>
            <p className="mt-6 text-sm uppercase tracking-[0.22em] text-stone-500">{categoryLabel}</p>
          </Card>
        </div>
      </PageShell>
    </>
  )
}

function HomePage() {
  const featuredProducts = getHomepageFeaturedProducts(shopProducts, 8)

  return (
    <>
      <PageMeta title={pageSeo.home.title} description={pageSeo.home.description} />

      <HeroCarousel />

      <section id="available-now" className="dark-section scroll-mt-28 w-full py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
                Available now
              </p>
              <h2 className="font-display text-4xl text-stone-100 sm:text-[2.75rem]">
                Available from the workshop.
              </h2>
              <p className="text-base leading-8 text-stone-300">
                Ready pieces and small-batch work currently available from Dom&apos;s Concepts.
              </p>
            </div>
            <SecondaryLink to="/available-pieces" className="text-stone-200 hover:text-amber-200">
              View all available pieces
            </SecondaryLink>
          </div>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((piece) => (
              <ProductCard key={piece.id} piece={piece} variant="luxury" />
            ))}
          </div>
        </div>
      </section>

      <PastProjectsTeaser />

      <section id="signature-work" className="scroll-mt-28 w-full border-t border-white/5 bg-[#0c0a09] py-14 sm:py-20 text-stone-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
              SIGNATURE WORK
            </p>
            <h2 className="font-display text-4xl text-white sm:text-5xl">
              Boards, tables, and workshop favourites.
            </h2>
            <p className="text-base leading-8 text-stone-300 sm:text-lg">
              From statement furniture and one-of-one knife displays to serving pieces and custom
              gifts, each project is designed around the material, its purpose and the space it
              belongs in.
            </p>
          </div>
          <SignatureWorkCarousel />
        </div>
      </section>

      <section id="reviews" className="dark-section w-full py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="CUSTOMER STORIES"
            title="Craftsmanship customers remember."
            intro="Real feedback from customers who have ordered boards, gifts and workshop care products from Dom's Concepts."
            compact
          />
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {premiumReviews.map((review) => (
              <ReviewCard key={review.id} review={review} luxury />
            ))}
          </div>
          <div className="mt-8">
            <a
              href={etsyShopUrl}
              target="_blank"
              rel="noreferrer"
              className={outlineButtonLightClassName}
            >
              Read more reviews on Etsy
            </a>
          </div>
        </div>
      </section>

      <section className="warm-section w-full py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <MakerAboutImage
              className="aspect-[4/3] w-full lg:order-1"
              priority
            />
            <div className="space-y-5 lg:order-2">
              <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
                MEET THE MAKER
              </p>
              <h2 className="font-display text-3xl text-white sm:text-4xl">
                Built by hand. Shaped by precision.
              </h2>
              <div className="space-y-4 text-base leading-8 text-stone-300">
                <p>Hi, I&apos;m Dominick.</p>
                <p>
                  I started Dom&apos;s Concepts in 2016 as a creative counterpoint to my
                  professional background in IT and technical problem-solving.
                </p>
                <p>
                  The two worlds have more in common than they might seem. Both depend on
                  precision, patience, careful planning and finding the right solution when
                  the obvious one does not work.
                </p>
                <p>
                  In the workshop, that means selecting hardwood for its grain and character,
                  refining every detail by hand and creating pieces designed to be used for
                  years.
                </p>
                <p>
                  From cutting boards and serving pieces to desks, dining tables and
                  one-of-one commissions, every Dom&apos;s Concepts project is built
                  individually in Prague.
                </p>
              </div>
              <p className="font-display text-xl text-stone-100">
                Technical thinking. Honest materials. Handmade results.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryLink to="/gallery">
                  Explore Past Projects
                </PrimaryLink>
                <SecondaryLink
                  to={CUSTOM_ORDER_FORM_ANCHOR}
                  variant="button"
                  className="text-center"
                >
                  Request a Custom Piece
                </SecondaryLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dark-section w-full py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-2xl space-y-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
              Workshop partners
            </p>
            <h2 className="font-display text-2xl text-stone-100 sm:text-3xl">
              Trusted collaborators
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {partnerItems.map((partner) => (
              <PartnerCard key={partner.name} partner={partner} compact />
            ))}
          </div>
          <div className="mt-6">
            <SecondaryLink to="/partners" className="text-stone-300 hover:text-amber-200">
              View all partners
            </SecondaryLink>
          </div>
        </div>
      </section>
    </>
  )
}

function MakerAboutImage({ className = '', priority = false }) {
  const [imageSrc, setImageSrc] = useState(makerAboutImagePath)

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-white/10',
        className,
      ].join(' ')}
    >
      <img
        src={imageSrc}
        alt="Dominick in the Dom's Concepts workshop in Prague"
        loading={priority ? 'eager' : 'lazy'}
        onError={() => {
          if (imageSrc !== workshopAboutImagePath) {
            setImageSrc(workshopAboutImagePath)
          }
        }}
        className="h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0a09]/50 via-[#14100e]/10 to-transparent" />
    </div>
  )
}

function WorkshopAboutImage({ className = '', priority = false }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div
        className={[
          'relative overflow-hidden rounded-2xl border border-white/10',
          className,
        ].join(' ')}
      >
        <div className="signature-image-placeholder h-full min-h-[18rem] w-full" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-white/10',
        className,
      ].join(' ')}
    >
      <img
        src={workshopAboutImagePath}
        alt="Dom's Concepts woodworking workshop in Prague"
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0a09]/50 via-[#14100e]/10 to-transparent" />
    </div>
  )
}

function AvailablePiecesPage() {
  const [activeCollection, setActiveCollection] = useState('All')
  const visibleCollections = ['All', ...getShopCollections()]
  const filteredProducts = activeCollection === 'All'
    ? shopProducts
    : shopProducts.filter((product) => product.collection === activeCollection)

  return (
    <>
      <PageMeta
        title={pageSeo.availablePieces.title}
        description={pageSeo.availablePieces.description}
      />
      <PageShell
        eyebrow="Shop the Collection"
        title="Available Pieces"
        intro="Browse current workshop pieces. Available items link to Etsy for checkout. Custom and sold pieces can be requested directly."
      >
        <div className="mb-8 flex flex-wrap gap-2">
          {visibleCollections.map((collection) => {
            const isActive = activeCollection === collection

            return (
              <button
                key={collection}
                type="button"
                onClick={() => setActiveCollection(collection)}
                className={[
                  isActive
                    ? goldChipActiveClassName
                    : 'rounded-full border border-[rgba(212,170,86,0.22)] bg-[rgba(24,18,14,0.72)] px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:border-amber-200/40 hover:text-stone-100',
                ].join(' ')}
              >
                {collection}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredProducts.map((piece) => (
            <ProductCard key={piece.id} piece={piece} variant="luxury" />
          ))}
        </div>
      </PageShell>
    </>
  )
}

function ProductDetailPage() {
  const { productId } = useParams()
  const redirectTarget = productId ? productIdRedirects[productId] : undefined
  const product = products.find((item) => item.id === productId)
  const rawGalleryImages = product ? getProductRealImages(product) : []
  const galleryImages = Array.isArray(rawGalleryImages) ? rawGalleryImages.filter(Boolean) : []
  const primaryGalleryImage = galleryImages[0] || ''
  const [activeImage, setActiveImage] = useState(primaryGalleryImage)

  useEffect(() => {
    setActiveImage(primaryGalleryImage)
  }, [product?.id, primaryGalleryImage])

  if (redirectTarget) {
    return <Navigate to={`/available-pieces/${redirectTarget}`} replace />
  }

  if (!product) {
    return (
      <PageShell
        eyebrow="Available Pieces"
        title="Product not found"
        intro="This piece may have moved or the link may be incomplete. You can still browse the current collection below."
      >
        <PrimaryLink to="/available-pieces">Back to Available Pieces</PrimaryLink>
      </PageShell>
    )
  }

  const primaryAction = getProductPrimaryAction(product)
  const secondaryAction = getProductSecondaryAction(product)
  const showBoardCareUpsell = product.careAddOnAvailable
  const socialProof = getProductSocialProof(product)

  return (
    <PageShell
      eyebrow={product.collection}
      title={product.name}
      intro={product.longDescription}
    >
      <div className="grid gap-8 overflow-x-hidden lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="min-w-0 space-y-4">
          {galleryImages.length > 0 ? (
            <PhotoFrame
              src={activeImage}
              alt={product.name}
              className="product-gallery-main aspect-[4/5] w-full md:h-[28rem] md:aspect-auto lg:h-[26rem]"
              overlay="none"
              priority
              showLabels={false}
              imageFit="contain"
            />
          ) : (
            <ProductDetailImageFallback productName={product.name} />
          )}
          {galleryImages.length > 1 ? (
            <div className="product-thumbnails">
              {galleryImages.map((image, index) => (
                <GalleryThumbnail
                  key={`${product.id}-${image}`}
                  image={image}
                  alt={`${product.name} photo ${index + 1}`}
                  isActive={activeImage === image}
                  onSelect={() => setActiveImage(image)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-sm text-stone-200">
                {product.collection}
              </span>
              <span
                className={[
                  'rounded-full border px-3 py-1.5 text-sm',
                  productBadgeClassesLuxury[product.badge],
                ].join(' ')}
              >
                {productBadgeLabels[product.badge] ?? product.badge}
              </span>
              {product.freeShipping ? (
                <span className="rounded-full border border-emerald-400/25 bg-emerald-950/40 px-3 py-1.5 text-sm text-emerald-200">
                  Free shipping
                </span>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ProductMeta label="Price" value={product.priceFrom} />
              <ProductMeta label="Dimensions" value={product.dimensions} />
              <ProductMeta label="Wood Type" value={product.woodType} />
              <ProductMeta label="Materials" value={product.materials || 'Selected materials'} />
              {galleryImages.length > 0 ? (
                <ProductMeta
                  label="Photos"
                  value={`${galleryImages.length} image${galleryImages.length === 1 ? '' : 's'}`}
                />
              ) : null}
            </div>
            <p className="mt-6 leading-8 text-stone-300">{product.longDescription}</p>
            {socialProof ? <ProductSocialProof review={socialProof} /> : null}
            <div className="mt-8 flex flex-col gap-3">
              <ProductActionButton action={primaryAction} className={goldButtonClassName} />
              <ProductActionButton
                action={secondaryAction}
                className={outlineButtonLightClassName}
              />
              <SecondaryLink to="/available-pieces" className="mt-1 self-start text-stone-400">
                Back to collection
              </SecondaryLink>
            </div>
            {showBoardCareUpsell ? <BoardCareUpsell product={product} /> : null}
          </Card>
          {product.features?.length ? (
            <Card>
              <h2 className="font-serif text-3xl text-white">Features</h2>
              <ul className="mt-5 space-y-3 text-stone-300">
                {product.features.map((feature) => (
                  <li key={feature} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {product.perfectFor?.length ? (
            <Card>
              <h2 className="font-serif text-3xl text-white">Perfect For</h2>
              <ul className="mt-5 space-y-3 text-stone-300">
                {product.perfectFor.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {product.whyThisPiece || product.whyEndGrain ? (
            <Card>
              <h2 className="font-serif text-3xl text-white">
                {product.whyEndGrain ? 'Why End Grain' : 'Why This Piece'}
              </h2>
              <p className="mt-5 leading-8 text-stone-300">
                {product.whyEndGrain || product.whyThisPiece}
              </p>
            </Card>
          ) : null}
          {product.careInstructions ? (
            <Card>
              <h2 className="font-serif text-3xl text-white">Care Instructions</h2>
              <p className="mt-5 leading-8 text-stone-300">{product.careInstructions}</p>
            </Card>
          ) : null}
          {product.shippingNote ? (
            <Card>
              <h2 className="font-serif text-3xl text-white">Returns / Shipping</h2>
              <p className="mt-5 leading-8 text-stone-300">{product.shippingNote}</p>
            </Card>
          ) : null}
          {product.etsyUrl ? (
            <Card>
              <p className="text-sm leading-7 text-stone-300">
                This piece is also listed externally.
              </p>
              <a
                href={product.etsyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-full border border-amber-200/35 bg-stone-900 px-5 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-200 hover:bg-stone-800"
              >
                View on Etsy
              </a>
            </Card>
          ) : null}
        </div>
      </div>
    </PageShell>
  )
}

function GalleryPage() {
  const visibleProjects = getVisibleGalleryProjects()

  return (
    <>
      <PageMeta
        title={pageSeo.gallery?.title ?? "Past Projects | Dom's Concepts"}
        description={
          pageSeo.gallery?.description ??
          'A look back at furniture, serving pieces and one-of-one creations handmade by Dom\'s Concepts in Prague since 2016.'
        }
      />
      <PageShell
        eyebrow="PAST PROJECTS"
        title="A look back at pieces built over the years."
        intro="Furniture, serving pieces and one-of-one creations handmade by Dom's Concepts since 2016."
      >
        <PastProjectsCredibilityRow />

        <div id="past-projects" className="scroll-mt-28">
          <PastProjectsGrid
            projects={visibleProjects}
            showFilters
            featuredLayout
            hidePlaceholder
            enableLightbox
          />
        </div>
      </PageShell>
    </>
  )
}

function CustomOrdersPage() {
  const [searchParams] = useSearchParams()
  const selectedProductId = searchParams.get('product') || ''
  const selectedProduct = products.find((item) => item.id === selectedProductId)
  const selectedPiece = selectedProduct?.name || selectedProductId
  const presetCareAddon = resolveBoardCareAddon(searchParams)

  return (
    <>
      <PageMeta
        title={pageSeo.customOrders.title}
        description={pageSeo.customOrders.description}
      />
      <PageShell
        eyebrow="Custom commissions"
        title="Want a piece made just for you?"
        intro="Send an idea, size, wood type or reference photo and I'll help turn it into a custom handmade piece."
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <p className="section-eyebrow">How it works</p>
            <h2 className="mt-4 font-display text-3xl text-stone-100">Custom orders, quoted personally</h2>
            <p className="mt-4 leading-8 text-stone-300">
              Share the product type, wood direction, size, and whether you want engraving
              or logo work. Every order is reviewed personally before a quote is confirmed.
            </p>
            <div className="mt-6 space-y-4">
              {customOrderSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <span className="mt-1 text-xs uppercase tracking-[0.3em] text-amber-200/80">
                    0{index + 1}
                  </span>
                  <p className="text-stone-300">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={outlineButtonLightClassName}
              >
                Message on Instagram
              </a>
            </div>
          </Card>
          <div id="custom-quote-form">
            <OrderForm
              title="Request Custom Quote"
              presetProduct={selectedPiece}
              presetCareAddon={presetCareAddon}
              defaultMessage={
                selectedPiece && presetCareAddon !== 'none'
                  ? `I would like to reserve "${selectedPiece}" with ${getBoardCareAddonLabel(presetCareAddon)}.`
                  : selectedPiece
                    ? `I would like to reserve or ask about "${selectedPiece}".`
                    : presetCareAddon !== 'none'
                      ? `I would like to add ${getBoardCareAddonLabel(presetCareAddon)} to a board order.`
                      : ''
              }
            />
          </div>
        </div>
      </PageShell>
    </>
  )
}

function CareGuidePage() {
  return (
    <>
      <PageMeta title={pageSeo.careGuide.title} description={pageSeo.careGuide.description} />
      <PageShell
      eyebrow="Care Guide"
      title="Simple care that keeps solid wood performing beautifully."
      intro="Every piece is made to be used, but hardwood lasts best when it is cleaned, dried, and nourished properly."
    >
      <div className="grid gap-6">
        <Card className="bg-white/[0.03]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                QR-Code Friendly Care Guide
              </p>
              <p className="mt-3 text-lg leading-8 text-stone-300">
                This page is designed to be easy to scan from a printed board
                care card, with clear sections and direct product care guidance.
              </p>
            </div>
            <a
              href={etsyShopUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-stone-900 px-6 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-200 hover:bg-stone-800"
            >
              Reorder Wood Butter
            </a>
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="font-serif text-3xl text-white">Board care essentials</h2>
          <div className="mt-6 space-y-4">
            {careGuidePoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-5 text-stone-200"
              >
                <h3 className="font-serif text-2xl text-white">{point.title}</h3>
                <p className="mt-3 leading-8 text-stone-300">{point.text}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-serif text-3xl text-white">Dom&apos;s Concepts board care</h2>
          <p className="mt-5 leading-8 text-stone-300">
            Refresh hardwood boards and serving pieces with workshop-made wood butter
            for routine conditioning, or wood wax when you want a stronger protective
            finish. Both are available as standalone products or as a 30% board-order
            add-on.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {boardCareProducts.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20"
              >
                <PhotoFrame
                  src={item.image}
                  alt={item.title}
                  className="aspect-[4/3] w-full rounded-none border-0"
                  overlay="none"
                  showLabels={false}
                />
                <p className="p-4 font-serif text-lg text-white">{item.title}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-200/8 p-5 text-sm leading-7 text-amber-50">
            Avoid dishwashers, prolonged soaking, and direct heat exposure.
          </div>
        </Card>
      </div>
      <Card className="mt-8 bg-gradient-to-r from-amber-200/10 via-stone-900/80 to-black/80">
        <div className="flex flex-col gap-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              Board care add-on
            </p>
            <h2 className="mt-3 font-serif text-3xl text-white">Need board care?</h2>
            <p className="mt-4 leading-8 text-stone-300">
              Add Dom&apos;s Concepts wood butter or wax to any board order and save{' '}
              {boardCarePricing.discountLabel}.
            </p>
          </div>
          <BoardCareProductsGrid />
        </div>
      </Card>
      </div>
    </PageShell>
    </>
  )
}

function PartnersPage() {
  return (
    <PageShell
      eyebrow="Workshop Partners"
      title="Trusted workshop brands and collaborators"
      intro="Materials, finish systems, abrasives, and workshop tools used in the Dom&apos;s Concepts studio — shared with respect for the brands behind the craft."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {partnerItems.map((partner) => (
          <PartnerCard key={partner.name} partner={partner} />
        ))}
      </div>
      <div className="mt-10">
        <Card className="bg-gradient-to-r from-amber-200/10 via-stone-900/80 to-black/80">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                Partnership Enquiries
              </p>
              <h2 className="mt-3 font-serif text-3xl text-white">
                Interested in partnering with Dom&apos;s Concepts?
              </h2>
            </div>
            <PrimaryLink to="/contact">Start the conversation</PrimaryLink>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

function AboutPage() {
  return (
    <>
      <PageMeta title={pageSeo.about.title} description={pageSeo.about.description} />
      <PageShell
      eyebrow="About"
      title="A Prague woodworking brand centered on material, function, and finish."
      intro="Founded in 2016, Dom&apos;s Concepts makes premium handmade kitchen and serving pieces with a small-batch workshop approach."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
            Slow wood. Honest craft. Handmade wood and epoxy pieces from Prague.
          </p>
          <div className="space-y-5 leading-8 text-stone-300">
            <p>
              Dom&apos;s Concepts is a small handmade woodworking brand based in
              Prague. Since 2016, the workshop has focused on premium wooden
              pieces, cutting boards, butcher blocks, serving boards, coasters,
              wood care products, and selected epoxy projects.
            </p>
            <p>
              The brand also sells through Etsy under {etsyShopName} and has
              been on Etsy since 2019. Dom&apos;s Concepts values durable
              materials, premium finishing, balanced proportions, and practical
              use across kitchen pieces, corporate gifts, restaurant boards,
              and custom logo work.
            </p>
            <p className="text-stone-200">
              Custom sizes, wood combinations, logo engraving, and special
              pieces are available on request.
            </p>
          </div>
        </Card>
        <div className="space-y-6">
          <WorkshopAboutImage className="aspect-[5/4] w-full" priority />
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat value="2016" label="Handmade brand active since" />
            <Stat value="Prague, Czechia" label="Workshop location" />
            <Stat value="5-star Etsy shop" label="Trusted by Etsy customers" />
            <Stat value="Since 2019" label="On Etsy" />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <Card className="bg-white/[0.03]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                Trusted by Etsy customers
              </p>
              <p className="mt-3 max-w-3xl leading-8 text-stone-300">
                Dom&apos;s Concepts also sells handmade pieces through Etsy and
                has received 5-star customer feedback for craftsmanship,
                service, and wood care products.
              </p>
            </div>
            <a
              href={etsyShopUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-stone-900 px-6 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-200 hover:bg-stone-800"
            >
              View Etsy Shop
            </a>
          </div>
        </Card>
      </div>
      <div className="mt-12">
        <SectionHeading
          eyebrow="Instagram"
          title="From the workshop"
          intro="Short process clips, finished pieces and workshop moments from Dom's Concepts."
          compact
        />
        <div className="grid gap-5 md:grid-cols-3">
          {instagramVideos.map((video) => (
            <InstagramVideoCard key={video.id} video={video} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={goldButtonClassName}
          >
            Follow @doms_concepts on Instagram
          </a>
        </div>
      </div>
    </PageShell>
    </>
  )
}

function ReviewsPage() {
  return (
    <>
      <PageMeta title={pageSeo.reviews.title} description={pageSeo.reviews.description} />
      <PageShell
        eyebrow="Customer Stories"
        title="Craftsmanship customers remember."
        intro="Real feedback from customers who have ordered boards, gifts and workshop care products from Dom's Concepts."
      >
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reviewTrustPoints.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-amber-200/20 bg-black/25 px-5 py-4 text-center text-sm text-stone-200"
            >
              {point}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} luxury />
          ))}
        </div>

        <div className="mt-10">
          <a
            href={etsyShopUrl}
            target="_blank"
            rel="noreferrer"
            className={outlineButtonLightClassName}
          >
            Read more reviews on Etsy
          </a>
        </div>
      </PageShell>
    </>
  )
}

function FaqPage() {
  return (
    <>
      <PageMeta title={pageSeo.faq.title} description={pageSeo.faq.description} />
      <PageShell
        eyebrow="FAQ"
        title="Questions about custom work, shipping, and care."
        intro="Short answers to the most common enquiries. For anything more specific, send a message through the contact form."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <FaqCard key={item.question} item={item} />
          ))}
        </div>
        <div className="mt-10">
          <PrimaryLink to="/contact">Ask a question</PrimaryLink>
        </div>
      </PageShell>
    </>
  )
}

function LegalDocumentPage({ slug }) {
  const page = legalPages.find((item) => item.slug === slug)

  if (!page) {
    return (
      <PageShell
        eyebrow="Legal"
        title="Page not found"
        intro="This legal page could not be found."
      >
        <PrimaryLink to="/">Back to home</PrimaryLink>
      </PageShell>
    )
  }

  return (
    <>
      <PageMeta
        title={`${page.title} | Dom's Concepts`}
        description={page.intro}
      />
      <PageShell eyebrow="Legal" title={page.title} intro={page.intro}>
        <div className="max-w-3xl space-y-5">
          {page.body.map((paragraph) => (
            <p key={paragraph} className="leading-8 text-stone-300">
              {paragraph}
            </p>
          ))}
        </div>
      </PageShell>
    </>
  )
}

function PartnerLogo({ partner, compact = false }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [partner.logo])

  const wrapClassName = [
    'partner-logo-wrap w-full',
    partner.logoWrapClass,
    compact ? 'partner-logo-wrap-compact mb-3' : 'mb-6',
  ]
    .filter(Boolean)
    .join(' ')

  const logoClassName = ['partner-logo', partner.logoClass].filter(Boolean).join(' ')

  if (hasError) {
    return (
      <div className={wrapClassName}>
        <span
          className={[
            'text-center font-serif text-amber-100/90',
            compact ? 'text-lg' : 'text-xl sm:text-2xl',
          ].join(' ')}
        >
          {partner.fallbackInitial || partner.fallbackName || partner.name}
        </span>
      </div>
    )
  }

  return (
    <div className={wrapClassName}>
      <img
        src={partner.logo}
        alt={`${partner.name} logo`}
        loading="lazy"
        onError={() => setHasError(true)}
        className={logoClassName}
      />
    </div>
  )
}

function PartnerCard({ partner, compact = false }) {
  if (compact) {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-[11.5rem] flex-col rounded-2xl border border-amber-200/20 bg-stone-900/90 px-4 py-4 text-center transition hover:border-amber-200/45 hover:bg-stone-800"
      >
        <PartnerLogo partner={partner} compact />
        <span className="font-medium text-amber-50 transition group-hover:text-amber-100">
          {partner.name}
        </span>
        <span className="mt-auto pt-3 text-[10px] uppercase tracking-[0.18em] text-stone-500 transition group-hover:text-amber-200/80">
          Visit partner ↗
        </span>
      </a>
    )
  }

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/[0.05]"
    >
      <PartnerLogo partner={partner} />
      <h2 className="font-serif text-2xl text-white transition group-hover:text-amber-100">
        {partner.name}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-7 text-stone-300">
        {partner.description}
      </p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-stone-500 transition group-hover:text-amber-200/80">
        Visit partner ↗
      </p>
    </a>
  )
}

function FaqCard({ item }) {
  return (
    <Card className="h-full">
      <h2 className="font-serif text-xl text-white">{item.question}</h2>
      <p className="mt-3 text-sm leading-7 text-stone-300">{item.answer}</p>
    </Card>
  )
}

function InstagramVideoCard({ video }) {
  const [hasError, setHasError] = useState(false)
  const reelUrl =
    video.instagramUrl && video.instagramUrl !== placeholderInstagramReelUrl
      ? video.instagramUrl
      : instagramUrl

  useEffect(() => {
    setHasError(false)
  }, [video.thumbnail])

  const showThumbnail = Boolean(video.thumbnail) && !hasError

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200/15 bg-stone-900/90 shadow-xl shadow-black/25 transition duration-300 hover:-translate-y-0.5 hover:border-amber-200/35 hover:bg-stone-800/95">
      <a
        href={reelUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${video.title} on Instagram`}
        className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#1c1511] via-stone-950 to-black"
      >
        {showThumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="signature-image-placeholder h-full w-full" aria-hidden="true" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        <p className="pointer-events-none absolute left-4 top-4 text-[10px] uppercase tracking-[0.22em] text-amber-200/90">
          Instagram Reel
        </p>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/35 bg-black/50 text-amber-50 opacity-80 backdrop-blur-sm transition group-hover:opacity-100">
            ↗
          </span>
        </div>
      </a>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex-1">
          <h3 className="font-serif text-xl text-white">{video.title}</h3>
          <p className="mt-2 text-sm leading-7 text-stone-300">{video.description}</p>
        </div>
        <a
          href={reelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={goldButtonClassNameCompact}
        >
          Watch on Instagram
        </a>
      </div>
    </article>
  )
}

function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Start a reservation, custom order, or workshop enquiry."
      intro="For available pieces, custom sizing, engraving, or care product questions, get in touch directly."
    >
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="font-serif text-3xl text-white">Direct contact</h2>
          <div className="mt-6 space-y-4 text-stone-300">
            <p>Email:</p>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block text-lg text-amber-200 transition hover:text-amber-100"
            >
              {contactEmail}
            </a>
            <p className="pt-4 leading-8">
              Based in Prague, Czechia. Pickup and shipping options can be
              discussed per order request.
            </p>
            <a
              href={etsyShopUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-stone-200 transition hover:text-amber-200"
            >
              Etsy: {etsyShopName}
            </a>
          </div>
        </Card>
        <OrderForm title="Send an enquiry" />
      </div>
    </PageShell>
  )
}

function BoardCareProductsGrid({ compact = false, luxury = false }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {boardCareProducts.map((item) => (
        <BoardCareProductCard key={item.id} product={item} compact={compact} luxury={luxury} />
      ))}
    </div>
  )
}

function BoardCareProductCard({ product, compact = false, luxury = false }) {
  const action = getBoardCareButtonAction(product)

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0" luxury={luxury}>
      <PhotoFrame
        src={product.image}
        alt={product.title}
        className={compact ? 'aspect-[5/3] w-full rounded-b-none border-0' : 'aspect-[4/3] w-full rounded-b-none border-0'}
        overlay="none"
        showLabels={false}
      />
      <div className={compact ? 'flex flex-1 flex-col gap-3 p-5' : 'flex flex-1 flex-col gap-4 p-6'}>
        <h3 className={compact ? 'font-serif text-xl text-white' : 'font-serif text-2xl text-white'}>
          {product.title}
        </h3>
        <div className="text-sm text-stone-300">
          <p>
            Normal price:{' '}
            <span className="text-stone-200">{boardCarePricing.normalPrice}</span>
          </p>
          <p className="mt-1">
            Board add-on price:{' '}
            <span className="font-medium text-amber-100">{boardCarePricing.addonPrice}</span>
          </p>
        </div>
        {compact ? null : (
          <p className="text-sm leading-7 text-stone-300">{product.description}</p>
        )}
        <div className="mt-auto pt-2">
          <a
            href={action.href}
            target="_blank"
            rel="noreferrer"
            className={goldButtonClassName}
          >
            {action.label}
          </a>
        </div>
      </div>
    </Card>
  )
}

function BoardCareUpsell({ product }) {
  const etsyHref = getProductEtsyHref(product)
  const purchaseOptions = [
    { label: 'Choose Wood Butter on Etsy', href: etsyHref },
    { label: 'Choose Wood Wax on Etsy', href: etsyHref },
    { label: 'Buy without add-on on Etsy', href: etsyHref },
  ]

  return (
    <div className="mt-8 rounded-[1.4rem] border border-amber-200/20 bg-gradient-to-br from-[#1c1511] via-stone-950 to-black p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
        Workshop recommendation
      </p>
      <h2 className="mt-3 font-serif text-2xl text-white">Add board care and save 30%</h2>
      <p className="mt-3 text-sm leading-7 text-stone-300">
        Choose Wood Butter or Wood Wax as a discounted add-on on the Etsy listing.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {purchaseOptions.map((option) => (
          <a
            key={option.label}
            href={option.href}
            target="_blank"
            rel="noreferrer"
            className={option.label === 'Buy without add-on on Etsy' ? outlineButtonLightClassName : goldButtonClassName}
          >
            {option.label}
          </a>
        ))}
      </div>
    </div>
  )
}

function ProductCardImage({ src, alt }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (hasError) {
    return <div className="signature-image-placeholder h-full w-full" aria-hidden="true" />
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
    />
  )
}

function ProductActionButton({ action, className = goldButtonClassNameCompact }) {
  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {action.label}
      </a>
    )
  }

  if (action.href.startsWith('/')) {
    return (
      <Link to={action.href} className={className}>
        {action.label}
      </Link>
    )
  }

  return (
    <a href={action.href} className={className}>
      {action.label}
    </a>
  )
}

function ProductCard({ piece, variant = 'luxury' }) {
  const action = getProductPrimaryAction(piece)
  const isLuxury = variant === 'luxury'
  const badgeLabel = productBadgeLabels[piece.badge] ?? piece.badge
  const detailHref = `/available-pieces/${piece.id}`

  return (
    <article
      className={[
        isLuxury ? 'luxury-shop-card' : 'shop-card',
        'group flex h-full flex-col hover:-translate-y-0.5',
        piece.isSold ? 'opacity-90' : '',
      ].join(' ')}
    >
      <Link
        to={detailHref}
        className="block overflow-hidden"
        aria-label={`View ${piece.name}`}
      >
        <div
          className={[
            'relative aspect-[4/5] overflow-hidden bg-[#1c1511]',
            piece.isSold ? 'grayscale-[0.2]' : '',
          ].join(' ')}
        >
          <ProductCardImage src={piece.image} alt={piece.name} />
          {piece.isSold ? (
            <div className="pointer-events-none absolute inset-0 bg-stone-900/20" />
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-2.5">
          <span
            className={[
              'inline-flex rounded-md border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]',
              productBadgeClassesLuxury[piece.badge],
            ].join(' ')}
          >
            {badgeLabel}
          </span>
          <Link
            to={detailHref}
            className="line-clamp-2 font-display text-xl leading-snug text-stone-100 transition hover:text-amber-200"
          >
            {piece.name}
          </Link>
          <p className="line-clamp-2 text-sm leading-6 text-stone-400">
            {piece.shortDescription}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <p className="text-base font-medium text-stone-200">{piece.priceFrom}</p>
          {piece.freeShipping ? (
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-400/85">
              Free shipping
            </p>
          ) : null}
          <ProductActionButton action={action} />
        </div>
      </div>
    </article>
  )
}

function ReviewCard({ review, luxury = false }) {
  const cardClassName = luxury ? 'luxury-review-card' : 'premium-card h-full p-6'

  return (
    <article className={cardClassName}>
      <div
        className="flex gap-1 text-amber-200/90"
        aria-label={`${review.rating} out of 5 stars`}
      >
        {Array.from({ length: review.rating }).map((_, index) => (
          <span key={index} aria-hidden="true">
            ★
          </span>
        ))}
      </div>
      <blockquote className="mt-4 text-sm leading-7 text-stone-200">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <footer className="mt-5 space-y-1">
        <p className="text-sm font-medium text-stone-100">{review.name}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-amber-200/70">
          Verified Etsy review
        </p>
        {review.product ? (
          <p className="text-xs text-stone-400">{review.product}</p>
        ) : null}
      </footer>
    </article>
  )
}

function ProductSocialProof({ review }) {
  return (
    <div className="product-social-proof mt-6">
      <p className="text-sm leading-7 text-stone-200">
        <span className="text-amber-200/90" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: review.rating })
            .map(() => '★')
            .join('')}
        </span>{' '}
        &ldquo;{review.shortQuote || review.quote}&rdquo; — {review.name}, verified Etsy review
      </p>
    </div>
  )
}

function OrderForm({ title, presetProduct = '', presetCareAddon = 'none', defaultMessage = '' }) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    product: presetProduct,
    productType: customProductTypes[0],
    woodPreference: woodPreferences[0],
    size: '',
    engraving: engravingOptions[1],
    shipping: shippingOptions[0],
    budget: budgetRanges[1],
    boardCareAddon: presetCareAddon,
    message: defaultMessage,
    referenceImage: '',
  })

  useEffect(() => {
    setFormState((current) => ({
      ...current,
      product: presetProduct || current.product,
      boardCareAddon: presetCareAddon,
      message: defaultMessage || current.message,
    }))
  }, [defaultMessage, presetCareAddon, presetProduct])

  const mailtoHref = useMemo(() => {
    const subject = formState.product
      ? `Dom's Concepts enquiry: ${formState.product}`
      : "Dom's Concepts enquiry"
    const careLabel = getBoardCareAddonLabel(formState.boardCareAddon)
    const carePriceNote =
      formState.boardCareAddon === 'wood-butter' || formState.boardCareAddon === 'wood-wax'
        ? ` (${boardCarePricing.addonPrice} board add-on price, normally ${boardCarePricing.normalPrice})`
        : ''

    const body = [
      `Name: ${formState.name}`,
      `Email: ${formState.email}`,
      `Phone: ${formState.phone || 'Not provided'}`,
      `Product type: ${formState.productType}`,
      `Product / piece name: ${formState.product || 'Not specified'}`,
      `Board care add-on: ${careLabel}${carePriceNote}`,
      `Wood preference: ${formState.woodPreference}`,
      `Size: ${formState.size || 'Not specified'}`,
      `Logo / engraving: ${formState.engraving}`,
      `Pickup or shipping: ${formState.shipping}`,
      `Budget range: ${formState.budget}`,
      `Reference image: ${formState.referenceImage || 'Not attached yet'}`,
      '',
      'Message:',
      formState.message || 'No additional message.',
    ].join('\n')

    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [formState])

  function updateField(event) {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  return (
    <Card>
      <h2 className="font-display text-3xl text-stone-100">{title}</h2>
      <p className="mt-4 leading-8 text-stone-300">
        This form opens your email client to send the request to {contactEmail}.
      </p>

      {presetProduct ? (
        <div className="form-highlight mt-6">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80">
            Selected Product
          </p>
          <p className="mt-2 text-lg text-stone-100">{presetProduct}</p>
        </div>
      ) : null}

      {presetCareAddon !== 'none' ? (
        <div className="form-highlight-muted mt-4">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/85">
            Board Care Add-on
          </p>
          <p className="mt-2 text-sm text-stone-200">
            {getBoardCareAddonLabel(presetCareAddon)}
            {presetCareAddon === 'wood-butter' || presetCareAddon === 'wood-wax'
              ? ` · ${boardCarePricing.addonPrice} (normally ${boardCarePricing.normalPrice})`
              : ''}
          </p>
        </div>
      ) : null}

      <form className="mt-8 grid gap-5" action={mailtoHref}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Name" name="name" value={formState.name} onChange={updateField} required />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formState.email}
            onChange={updateField}
            required
          />
        </div>
        <SelectField
          label="Product type"
          name="productType"
          value={formState.productType}
          onChange={updateField}
          options={customProductTypes}
        />
        <FormField
          label="Product / piece name optional"
          name="product"
          value={formState.product}
          onChange={updateField}
        />
        <SelectField
          label="Budget range"
          name="budget"
          value={formState.budget}
          onChange={updateField}
          options={budgetRanges}
        />
        <div className="grid gap-2">
          <label className="form-label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formState.message}
            onChange={updateField}
            className="form-textarea"
          />
        </div>
        <div className="form-note">
          Reference image upload placeholder — attach your reference photo in the email after submitting.
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" className={goldButtonClassName}>
            Request Custom Quote
          </button>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className={outlineButtonLightClassName}
          >
            Message on Instagram
          </a>
        </div>
      </form>
    </Card>
  )
}

function FormField({ label, name, type = 'text', value, onChange, required = false }) {
  return (
    <div className="grid gap-2">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="form-input"
      />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options, optionValues }) {
  const entries = optionValues
    ? options.map((optionLabel, index) => ({
        label: optionLabel,
        value: optionValues[index],
      }))
    : options.map((option) => ({ label: option, value: option }))

  return (
    <div className="grid gap-2">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="form-select"
      >
        {entries.map((entry) => (
          <option key={entry.value} value={entry.value}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ProductMeta({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-400">{label}</p>
      <p className="mt-2 text-stone-100">{value}</p>
    </div>
  )
}

function SectionHeading({ eyebrow, title, intro, compact = false }) {
  return (
    <div className={compact ? 'max-w-2xl space-y-4' : 'mb-10 max-w-3xl space-y-4'}>
      <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80">{eyebrow}</p>
      <h2 className="font-display text-3xl text-stone-100 sm:text-4xl">{title}</h2>
      <p className="leading-8 text-stone-300">{intro}</p>
    </div>
  )
}

function Card({ children, className = '', luxury = false }) {
  return (
    <div
      className={[
        luxury ? 'luxury-glass-card p-6 sm:p-8' : 'premium-card p-6 sm:p-8',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

function ProductDetailImageFallback({ productName }) {
  return (
    <div
      className="relative flex h-[26rem] items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#1c1511] via-stone-950 to-black shadow-[inset_0_1px_0_rgba(251,191,36,0.07),0_18px_40px_-28px_rgba(0,0,0,0.85)]"
      aria-label={`${productName} photo coming soon`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,15,0.14)_0%,_transparent_72%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20" />
      <p className="relative z-[1] px-6 text-center text-sm uppercase tracking-[0.3em] text-stone-300">
        Workshop photos coming soon
      </p>
    </div>
  )
}

function GalleryThumbnail({ image, alt, isActive, onSelect }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [image])

  if (!image || hasError) {
    return null
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'product-thumbnail overflow-hidden rounded-[1.2rem] border transition',
        isActive
          ? 'border-amber-100/70'
          : 'border-white/10 hover:border-amber-200/45',
      ].join(' ')}
    >
      <img
        src={image}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover object-center bg-gradient-to-br from-[#1c1511] via-stone-950 to-black md:object-contain md:p-2"
      />
    </button>
  )
}

function PhotoFrame({
  src,
  alt,
  label = '',
  className = '',
  overlay = 'default',
  priority = false,
  showLabels = true,
  imageFit = 'cover',
  placeholderMessage = 'Photo coming soon',
}) {
  const [hasError, setHasError] = useState(false)
  const isContained = imageFit === 'contain'
  const hasUsableSrc = typeof src === 'string' && src.trim().length > 0

  useEffect(() => {
    setHasError(false)
  }, [src])

  return (
    <div
      className={[
        'relative overflow-hidden rounded-[1.6rem] border border-white/10',
        isContained
          ? 'bg-gradient-to-br from-[#1c1511] via-stone-950 to-black shadow-[inset_0_1px_0_rgba(251,191,36,0.07),0_18px_40px_-28px_rgba(0,0,0,0.85)]'
          : 'bg-stone-900',
        className,
      ].join(' ')}
    >
      {isContained && !hasError ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,15,0.14)_0%,_transparent_72%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20" />
        </>
      ) : null}
      {!hasError && hasUsableSrc ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setHasError(true)}
          className={[
            isContained
              ? 'relative z-[1] h-full w-full object-contain object-center p-3'
              : 'absolute inset-0 z-[1] h-full w-full object-cover object-center',
          ].join(' ')}
        />
      ) : null}
      {hasError || !hasUsableSrc ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c1511] via-stone-950 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_35%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-stone-100">
              {placeholderMessage}
            </p>
          </div>
        </>
      ) : (
        <>
          {overlay !== 'none' ? (
            <div
              className={[
                'pointer-events-none absolute inset-0 z-[2]',
                overlay === 'dark'
                  ? 'bg-gradient-to-t from-black/70 via-black/25 to-black/10'
                  : 'bg-gradient-to-t from-black/55 via-black/10 to-transparent',
              ].join(' ')}
            />
          ) : null}
          {showLabels && label ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-stone-100">{label}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="font-serif text-2xl text-white">{value}</p>
      <p className="mt-2 text-sm text-stone-400">{label}</p>
    </div>
  )
}

function PrimaryLink({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={[goldButtonClassName, className].join(' ')}
    >
      {children}
    </Link>
  )
}

function SecondaryLink({ to, children, className = '', variant = 'text' }) {
  const baseClassName =
    variant === 'button'
      ? outlineButtonClassName
      : 'inline-flex items-center text-sm font-medium text-amber-200/90 transition hover:text-amber-100'

  return (
    <Link to={to} className={[baseClassName, className].join(' ')}>
      {children}
      {variant === 'text' ? ' →' : ''}
    </Link>
  )
}

export default App
