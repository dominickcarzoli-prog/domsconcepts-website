import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminCataloguePage from './admin/AdminCataloguePage.jsx'
import {
  ProductDetailInfoGrid,
  ProductDetailPurchaseInfo,
} from './components/ProductDescription.js'
import { ProductImageLightbox } from './components/ProductImageLightbox.js'
import { PublicRouteErrorBoundary } from './components/PublicRouteErrorBoundary.js'
import { parseEtsyDescription } from './data/parseEtsyDescription.js'
import {
  hasValidProductImageUrl,
  normalizeProductGallery,
} from './data/normalizeProductGallery.js'
import { LanguageSelector } from './i18n/LanguageSelector.jsx'
import {
  FirstVisitLocaleRedirect,
  LocaleProvider,
  useLocale,
} from './i18n/LocaleProvider.jsx'
import { parseLocaleFromPathname } from './i18n/localePaths.js'
import { translateActionLabel, translateBadgeLabel, translateCategoryLabel, translateGalleryCategoryLabel } from './i18n/translate.js'
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
  budgetRangeChoices,
  customProductTypeOptions,
  getBoardCareAddonLabel,
  getBoardCareButtonAction,
  homepageCarouselSlides,
  legalPages,
  aboutMakerPortraitPath,
  makerAboutImagePath,
  pageSeo,
  partnerItems,
  premiumReviews,
  resolveBoardCareAddon,
  workshopAboutImagePath,
} from './siteData'
import { useCurrency } from './currency/useCurrency'
import { CurrencySelector, EtsyPriceNote } from './currency/CurrencySelector.jsx'
import { FormattedPrice } from './currency/FormattedPrice.jsx'
import { getProductSocialProof, reviews } from './data/reviews'
import { getInstagramVideos } from './data/instagramVideos.js'
import {
  getBespokeCreationBySlug,
  getVisibleGalleryProjects,
} from './data/bespokeCreations'
import {
  GALLERY_CATEGORY_IDS,
  normalizeGalleryCategoryId,
} from './data/pastProjects.js'
import { getFeaturedSignaturePieces } from './data/signaturePieces.js'
import {
  CUSTOM_ORDER_FORM_ANCHOR,
  ETSY_SHOP_URL,
  getHomepageFeaturedProducts,
  getProductById,
  getProductDetailHref,
  getProductEtsyHref,
  getProductMaterialKey,
  getProductPrimaryAction,
  getProductRealImages,
  getProductSecondaryAction,
  getShopCollections,
  isProductMaterialKey,
  isPublished,
  productIdRedirects,
  products,
} from './data/products'
import { usePublicCatalogue } from './hooks/usePublicCatalogue'
import { usePublicProductDetail } from './hooks/usePublicProductDetail'
import {
  getNextSundayDeadlinePrague,
  getWorkshopDropEtsyHref,
  workshopDrop,
} from './data/workshopDrop'

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
const logoFallbackImagePath = '/images/doms-concepts-logo-gold.png'
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

function upsertLink(rel, href, attributes = {}) {
  const selector = attributes.hreflang
    ? `link[rel="${rel}"][hreflang="${attributes.hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let element = document.querySelector(selector)

  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  element.setAttribute('rel', rel)
  element.setAttribute('href', href)
  for (const [key, value] of Object.entries(attributes)) {
    if (value == null) element.removeAttribute(key)
    else element.setAttribute(key, value)
  }
}

function PageMeta({ title, description, ogImage = DEFAULT_OG_IMAGE, canonicalPath }) {
  const location = useLocation()
  const { locale, localize } = useLocale()

  useEffect(() => {
    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description', content: description })

    const path = canonicalPath ?? location.pathname
    const { pathnameWithoutLocale } = parseLocaleFromPathname(path)
    const localizedCanonical = localize(pathnameWithoutLocale)
    const canonicalUrl = `${SITE_URL}${localizedCanonical === '/' ? '' : localizedCanonical}`
    const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`

    const enPath = pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale
    const dePath =
      pathnameWithoutLocale === '/' ? '/de' : `/de${pathnameWithoutLocale}`
    const csPath =
      pathnameWithoutLocale === '/' ? '/cs' : `/cs${pathnameWithoutLocale}`
    const enUrl = `${SITE_URL}${enPath}`
    const deUrl = `${SITE_URL}${dePath}`
    const csUrl = `${SITE_URL}${csPath}`

    upsertLink('canonical', canonicalUrl)
    upsertLink('alternate', enUrl, { hreflang: 'en' })
    upsertLink('alternate', deUrl, { hreflang: 'de' })
    upsertLink('alternate', csUrl, { hreflang: 'cs' })
    upsertLink('alternate', enUrl, { hreflang: 'x-default' })

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: "Dom's Concepts",
    })
    upsertMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: locale === 'de' ? 'de_DE' : locale === 'cs' ? 'cs_CZ' : 'en_US',
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
  }, [canonicalPath, description, locale, localize, location.pathname, ogImage, title])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/catalogue" element={<AdminCataloguePage />} />
        <Route path="/cs" element={<LocalizedSite locale="cs" hasLocalePrefix />} />
        <Route path="/cs/*" element={<LocalizedSite locale="cs" hasLocalePrefix />} />
        <Route path="/de" element={<LocalizedSite locale="de" hasLocalePrefix />} />
        <Route path="/de/*" element={<LocalizedSite locale="de" hasLocalePrefix />} />
        <Route path="/en" element={<LocalizedSite locale="en" hasLocalePrefix />} />
        <Route path="/en/*" element={<LocalizedSite locale="en" hasLocalePrefix />} />
        <Route path="/*" element={<LocalizedSite locale="en" />} />
      </Routes>
    </BrowserRouter>
  )
}

function LocalizedSite({ locale, hasLocalePrefix = false }) {
  return (
    <LocaleProvider locale={locale} hasLocalePrefix={hasLocalePrefix}>
      <FirstVisitLocaleRedirect />
      <SiteLayout />
    </LocaleProvider>
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
  const { t, localize } = useLocale()

  const localizedNavItems = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.shop'), path: '/available-pieces' },
    { label: t('nav.gallery'), path: '/gallery' },
    { label: t('nav.customOrders'), path: '/custom-orders' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.contact'), path: '/contact' },
  ]

  const localizedFooterLinks = [
    { label: t('footer.shop'), path: '/available-pieces' },
    { label: t('footer.customOrders'), path: '/custom-orders' },
    { label: t('footer.about'), path: '/about' },
    { label: t('footer.reviews'), path: '/reviews' },
    { label: t('footer.contact'), path: '/contact' },
  ]

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0b09] text-stone-100">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d0b09]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to={localize('/')} className="flex min-w-0 items-center gap-2.5 sm:gap-3.5 lg:gap-4">
            <BrandMark />
            <div className="min-w-0 pt-0.5">
              <p className="truncate font-display text-[1.05rem] leading-none tracking-[0.01em] text-stone-100 sm:text-[1.15rem] lg:text-[1.28rem]">
                Dom&apos;s Concepts
              </p>
              <p className="mt-1 truncate text-[10px] uppercase tracking-[0.24em] text-stone-400 sm:text-[11px]">
                {t('brand.handmadeInPrague')}
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-stone-100 transition hover:border-amber-200/40 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {t('brand.menu')}
          </button>

          <div className="hidden items-center gap-5 lg:flex">
            <nav className="flex items-center gap-6">
              {localizedNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>
            <LanguageSelector variant="desktop" />
            <CurrencySelector variant="desktop" />
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-white/10 px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {localizedNavItems.map((item) => (
                <NavItem key={item.path} item={item} mobile />
              ))}
              <LanguageSelector variant="mobile" />
              <CurrencySelector variant="mobile" />
            </div>
          </nav>
        ) : null}
      </div>

      <main className="pt-24">
        <PublicRouteErrorBoundary>
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
        </PublicRouteErrorBoundary>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0807]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_1fr]">
            <div className="space-y-4">
              <p className="font-display text-2xl text-stone-100">Dom&apos;s Concepts</p>
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
                {t('brand.handmadeInPrague')}
              </p>
              <a
                className="inline-block text-stone-300 transition hover:text-amber-200"
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </a>
            </div>

            <div className="space-y-4 text-sm text-stone-400">
              <p className="font-medium text-stone-200">{t('brand.links')}</p>
              <div className="grid gap-3">
                {localizedFooterLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={localize(item.path)}
                    className="transition hover:text-[var(--color-accent)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-sm text-stone-400">
              <p className="font-medium text-stone-200">{t('brand.connect')}</p>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="block transition hover:text-[var(--color-accent)]">
                Instagram: {instagramHandle}
              </a>
              <a href={etsyShopUrl} target="_blank" rel="noopener noreferrer" className="block transition hover:text-[var(--color-accent)]">
                Etsy: {etsyShopName}
              </a>
              <p>IČO: {icoNumber}</p>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="text-sm text-stone-200">{t('brand.legal')}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
              {legalPages.map((page) => (
                <Link
                  key={page.slug}
                  to={localize(page.path)}
                  className="transition hover:text-[var(--color-accent)]"
                >
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
  const { localize } = useLocale()
  return (
    <NavLink
      to={localize(item.path)}
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

function PageShell({ eyebrow, title, intro, children, variant = 'default' }) {
  const isProduct = variant === 'product'

  return (
    <section
      className={[
        'page-shell warm-section w-full scroll-mt-28',
        isProduct ? 'page-shell--product' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
          isProduct ? 'pb-14 pt-10 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-14' : 'py-14 lg:py-20',
        ].join(' ')}
      >
        <div
          className={[
            isProduct
              ? 'product-detail-header mb-4 space-y-1.5 sm:mb-5 sm:space-y-2'
              : 'mb-10 max-w-3xl space-y-4 sm:space-y-5',
          ].join(' ')}
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80">{eyebrow}</p>
          <h1
            className={
              isProduct
                ? 'product-detail-title font-display text-stone-100'
                : 'font-display text-[2.2rem] leading-[1.08] text-stone-100 sm:text-[2.9rem] lg:text-[3.5rem]'
            }
          >
            {title}
          </h1>
          {intro ? (
            <p
              className={
                isProduct
                  ? 'product-detail-subtitle max-w-xl text-base leading-7 text-stone-400 sm:text-[1.05rem]'
                  : 'max-w-2xl text-base leading-7 text-stone-300 sm:text-lg sm:leading-8'
              }
            >
              {intro}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  )
}

function HeroCarousel() {
  const { t } = useLocale()
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
      aria-label={t('home.hero.ariaLabel')}
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
            {t('home.hero.eyebrow')}
          </p>
          <h1 className="font-display text-[2.45rem] leading-[1.03] text-white sm:text-[3.15rem] lg:text-[4rem]">
            {t('home.hero.title')}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-200 sm:text-lg sm:leading-8">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:gap-3">
            <a href="#signature-work" className={`${goldButtonClassName} w-full sm:w-auto`}>
              {t('home.hero.ctaSignature')}
            </a>
            <a href="#available-now" className={`${outlineButtonLightClassName} w-full sm:w-auto`}>
              {t('home.hero.ctaShop')}
            </a>
          </div>
          <p className="text-xs leading-5 tracking-[0.04em] text-stone-300/90 sm:text-sm sm:leading-6">
            {t('home.hero.trustLine')}
          </p>
        </div>

        {HERO_CAROUSEL_ENABLED ? (
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/10 pt-8">
            <div className="flex items-center gap-2">
              {homepageCarouselSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={t('home.hero.showSlide', { label: slide.label })}
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
                aria-label={t('home.hero.prevSlide')}
                onClick={() => goToSlide(activeIndex - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:border-amber-200/40 hover:bg-black/55"
              >
                ←
              </button>
              <button
                type="button"
                aria-label={t('home.hero.nextSlide')}
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

function SignatureWorkGrid() {
  const { locale } = useLocale()
  const pieces = getFeaturedSignaturePieces(locale)

  return (
    <div className="signature-work-grid mx-auto mt-10 max-w-6xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-7">
        {pieces.map((piece, index) => (
          <SignaturePieceCard
            key={piece.id}
            piece={piece}
            priority={index < 2}
          />
        ))}
      </div>
    </div>
  )
}

function SignaturePieceImage({
  src,
  alt = '',
  objectPosition = 'center center',
  imageScale = 0.92,
  priority = false,
}) {
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
      className="h-full w-full object-cover"
      style={{
        objectPosition,
        '--signature-img-scale': String(imageScale),
      }}
    />
  )
}

function SignaturePieceCard({ piece, priority = false }) {
  const { t, localize } = useLocale()
  const galleryPath = piece.galleryHash ? `/gallery#${piece.galleryHash}` : '/gallery'
  const galleryTo = localize(galleryPath.includes('#') ? galleryPath.split('#')[0] : galleryPath)
  const galleryHash = piece.galleryHash ? `#${piece.galleryHash}` : ''

  return (
    <Link
      to={`${galleryTo}${galleryHash}`}
      aria-label={`View ${piece.name} in Past Projects`}
      className="signature-piece-card group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[rgba(212,170,86,0.22)] bg-white/[0.04] shadow-[0_20px_48px_-34px_rgba(0,0,0,0.72)] outline-none transition duration-[400ms] ease-out motion-safe:hover:-translate-y-1.5 hover:border-amber-200/45 hover:shadow-[0_28px_56px_-28px_rgba(40,24,12,0.82)] focus-visible:border-amber-200/60 focus-visible:ring-2 focus-visible:ring-amber-200/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a09]"
    >
      <div className="signature-piece-card__media aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#0d0b09]">
        <SignaturePieceImage
          src={piece.image}
          alt=""
          objectPosition={piece.objectPosition}
          imageScale={piece.imageScale}
          priority={priority}
        />
      </div>
      <div className="flex min-h-[11.5rem] flex-1 flex-col gap-3 p-6 sm:min-h-[12.5rem] sm:gap-4 sm:p-7">
        <div className="space-y-1.5">
          <h3 className="font-display text-2xl leading-snug text-white">{piece.name}</h3>
          {piece.subtitle ? (
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/70">
              {piece.subtitle}
            </p>
          ) : (
            <p className="text-[11px] uppercase tracking-[0.22em] text-transparent" aria-hidden="true">
              &nbsp;
            </p>
          )}
        </div>
        <p className="flex-1 text-sm leading-7 text-stone-300 sm:text-base">{piece.description}</p>
        <span className="mt-auto text-xs uppercase tracking-[0.2em] text-amber-200/75 transition group-hover:text-amber-100">
          {t('home.signatureWork.viewInPastProjects')}
        </span>
      </div>
    </Link>
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

  const scale = project.thumbnailScale
  const hasCustomZoom = scale != null
  const style = { objectPosition: getCardObjectPosition(project) }
  if (hasCustomZoom) {
    style['--thumb-scale'] = String(scale)
    style.transform = `scale(${scale})`
    style.transformOrigin = 'center center'
  }

  return (
    <img
      src={project.image}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      style={style}
      className={[
        'past-project-card-image',
        hasCustomZoom ? 'past-project-card-image--custom-zoom' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
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
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      style={{
        objectPosition: getModalObjectPosition(project),
      }}
      className="past-project-modal-image"
    />
  )
}

function BespokeCreationCard({ project, hidePlaceholder = false, onSelect }) {
  const { t } = useLocale()
  const categoryId =
    project.categoryIds?.[0] ||
    normalizeGalleryCategoryId(project.category ?? project.categories?.[0])
  const categoryLabel =
    categoryId && categoryId !== 'all'
      ? translateGalleryCategoryLabel(categoryId, t, { singular: true })
      : ''

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
            className="transition duration-500"
          />
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/75">
          {t('galleryPage.completedProject')}
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
  const { t } = useLocale()
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

  const categoryId =
    project.categoryIds?.[0] ||
    normalizeGalleryCategoryId(project.category ?? project.categories?.[0])
  const categoryLabel =
    categoryId && categoryId !== 'all'
      ? translateGalleryCategoryLabel(categoryId, t, { singular: true })
      : ''

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
            {t('galleryPage.completedProject')}
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
  const { messages } = useLocale()
  const items = messages.galleryPage?.credibility || []
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.22em] text-stone-500">
      {items.map((item, index) => (
        <span key={item} className="inline-flex items-center gap-x-4">
          {index > 0 ? (
            <span className="hidden text-amber-200/30 sm:inline" aria-hidden="true">
              |
            </span>
          ) : null}
          <span>{item}</span>
        </span>
      ))}
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
  const { t } = useLocale()
  const [activeCategoryId, setActiveCategoryId] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)

  const filteredProjects =
    !showFilters || activeCategoryId === 'all'
      ? projects
      : projects.filter((project) =>
          (project.categoryIds || []).includes(activeCategoryId) ||
          (project.categories || []).some(
            (label) => normalizeGalleryCategoryId(label) === activeCategoryId,
          ),
        )

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
            {GALLERY_CATEGORY_IDS.map((categoryId) => {
              const isActive = activeCategoryId === categoryId

              return (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => setActiveCategoryId(categoryId)}
                  className={[
                    'shrink-0',
                    isActive
                      ? goldChipActiveClassName
                      : 'rounded-full border border-[rgba(212,170,86,0.22)] bg-[rgba(24,18,14,0.72)] px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:border-amber-200/40 hover:text-stone-100',
                  ].join(' ')}
                >
                  {translateGalleryCategoryLabel(categoryId, t)}
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
            id={project.slug}
            className={[
              'scroll-mt-28',
              featuredLayout && project.featured ? 'sm:col-span-2 lg:col-span-2' : '',
            ]
              .filter(Boolean)
              .join(' ')}
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

function formatCountdownParts(totalMs) {
  const clamped = Math.max(0, totalMs)
  const totalSeconds = Math.floor(clamped / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    expired: clamped <= 0,
  }
}

function WorkshopDropCountdown() {
  const { t } = useLocale()
  const [parts, setParts] = useState(() =>
    formatCountdownParts(getNextSundayDeadlinePrague().getTime() - Date.now()),
  )

  useEffect(() => {
    const tick = () => {
      setParts(formatCountdownParts(getNextSundayDeadlinePrague().getTime() - Date.now()))
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const units = [
    { key: 'days', label: t('home.workshopDrop.days'), value: parts.days },
    { key: 'hours', label: t('home.workshopDrop.hours'), value: parts.hours },
    { key: 'minutes', label: t('home.workshopDrop.minutes'), value: parts.minutes },
    { key: 'seconds', label: t('home.workshopDrop.seconds'), value: parts.seconds },
  ]

  return (
    <div
      className="workshop-drop-countdown grid grid-cols-4 gap-2 sm:gap-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {units.map((unit) => (
        <div
          key={unit.key}
          className="rounded-xl border border-[rgba(212,170,86,0.22)] bg-black/35 px-2 py-3 text-center sm:px-3 sm:py-4"
        >
          <p className="font-display text-2xl tabular-nums tracking-wide text-amber-100 sm:text-3xl">
            <span className="workshop-drop-digit inline-block min-w-[1.6ch]">{unit.value}</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">{unit.label}</p>
        </div>
      ))}
    </div>
  )
}

function WorkshopDropSection() {
  const { t } = useLocale()
  const { products: catalogueProducts } = usePublicCatalogue()
  const product =
    catalogueProducts.find(
      (item) =>
        item.id === workshopDrop.productId || item.slug === workshopDrop.productId,
    ) || getProductById(workshopDrop.productId)
  const publishedProduct = product && isPublished(product) ? product : null
  const imageSrc = publishedProduct
    ? getProductRealImages(publishedProduct)[0] || publishedProduct.mainImage
    : null
  const catalogEtsyUrl = publishedProduct
    ? getProductEtsyHref(publishedProduct)
    : ETSY_SHOP_URL
  const etsyHref = getWorkshopDropEtsyHref(catalogEtsyUrl)
  const [isDocumentHidden, setIsDocumentHidden] = useState(false)

  useEffect(() => {
    const handleVisibility = () => setIsDocumentHidden(document.hidden)
    handleVisibility()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  if (!publishedProduct || !imageSrc) {
    return null
  }

  return (
    <section
      id="workshop-drop"
      className="workshop-drop-section dark-section scroll-mt-28 w-full py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="workshop-drop-panel overflow-hidden rounded-2xl border border-[rgba(212,170,86,0.28)] bg-gradient-to-br from-[#1a1511] via-[#14100e] to-[#0c0a09]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="workshop-drop-media relative aspect-[4/5] overflow-hidden bg-[#1c1511] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[28rem]">
              <img
                src={imageSrc}
                alt={publishedProduct.name}
                loading="lazy"
                decoding="async"
                className={[
                  'workshop-drop-image absolute inset-0 h-full w-full object-cover',
                  isDocumentHidden ? 'is-paused' : '',
                ].join(' ')}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0a09]/55 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0c0a09]/35" />
            </div>

            <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
                  {t('home.workshopDrop.eyebrow')}
                </p>
                <h2 className="font-display text-3xl text-white sm:text-4xl">
                  {t('home.workshopDrop.supporting')}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-md border border-amber-200/35 bg-amber-950/45 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-100">
                    {t('home.workshopDrop.discount')}
                  </span>
                  <span className="text-sm text-stone-300">{t('home.workshopDrop.gift')}</span>
                </div>
                <p className="text-base leading-7 text-stone-300">{publishedProduct.name}</p>
              </div>

              <WorkshopDropCountdown />

              <a
                href={etsyHref}
                target="_blank"
                rel="noopener noreferrer"
                className={[goldButtonClassName, 'workshop-drop-cta w-full sm:w-auto'].join(' ')}
              >
                {t('home.workshopDrop.cta')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BespokeCreationDetailPage() {
  const { t, locale } = useLocale()
  const { projectSlug } = useParams()
  const project = getBespokeCreationBySlug(projectSlug, locale)

  if (!project) {
    return (
      <PageShell
        eyebrow={t('galleryPage.pastProjects')}
        title={t('galleryPage.projectNotFound')}
        intro={t('galleryPage.projectNotFoundIntro')}
      >
        <PrimaryLink to="/gallery">{t('galleryPage.backToPastProjects')}</PrimaryLink>
      </PageShell>
    )
  }

  const categoryLabel = (project.categoryIds || [])
    .map((id) => translateGalleryCategoryLabel(id, t, { singular: true }))
    .join(' · ')

  return (
    <>
      <PageMeta
        title={`${project.name} | Past Projects | Dom's Concepts`}
        description={`${project.name} — ${project.material}. A completed commission from Dom's Concepts in Prague.`}
        ogImage={project.image}
        canonicalPath={`/bespoke-creations/${project.slug}`}
      />
      <PageShell
        eyebrow={t('galleryPage.pastProjects')}
        title={project.name}
        intro={project.material}
      >
        <div className="mb-8">
          <SecondaryLink to="/gallery">{t('galleryPage.backToPastProjects')}</SecondaryLink>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1c1511]">
            <PastProjectCardImage project={project} alt={project.name} hidePlaceholder />
          </div>
          <Card luxury>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/75">
              {t('galleryPage.completedProject')}
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

function useIsMobileViewport(maxWidthPx = 767) {
  const query = `(max-width: ${maxWidthPx}px)`
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia(query)
    const sync = () => setIsMobile(mediaQuery.matches)

    sync()
    mediaQuery.addEventListener('change', sync)
    return () => mediaQuery.removeEventListener('change', sync)
  }, [query])

  return isMobile
}

function HomePage() {
  const { t } = useLocale()
  const isMobile = useIsMobileViewport(767)
  const { products: catalogueProducts } = usePublicCatalogue()
  const featuredProducts = getHomepageFeaturedProducts(catalogueProducts, 10).filter(
    (p) => p.id !== workshopDrop.productId && p.slug !== workshopDrop.productId,
  )
  const visibleProducts = isMobile ? featuredProducts.slice(0, 3) : featuredProducts

  return (
    <>
      <PageMeta title={t('home.seoTitle')} description={t('home.seoDescription')} />

      <HeroCarousel />

      <section id="available-now" className="dark-section scroll-mt-28 w-full py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
                {t('home.availableThisWeek.eyebrow')}
              </p>
              <h2 className="font-display text-4xl text-stone-100 sm:text-[2.75rem]">
                {t('home.availableThisWeek.title')}
              </h2>
              <p className="text-base leading-8 text-stone-300">
                {t('home.availableThisWeek.intro')}
              </p>
            </div>
            <SecondaryLink to="/available-pieces" className="text-stone-200 hover:text-amber-200">
              {t('home.availableThisWeek.viewAll')}
            </SecondaryLink>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((piece) => (
              <ProductCard key={piece.id} piece={piece} variant="luxury" />
            ))}
          </div>
          {isMobile && featuredProducts.length > 3 ? (
            <div className="mt-8">
              <SecondaryLink to="/available-pieces" className="text-amber-200/90 hover:text-amber-100">
                {t('home.availableThisWeek.viewAll')}
              </SecondaryLink>
            </div>
          ) : null}
        </div>
      </section>

      <WorkshopDropSection />

      <section id="signature-work" className="scroll-mt-28 w-full border-t border-white/5 bg-[#0c0a09] py-14 sm:py-20 text-stone-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
              {t('home.signatureWork.eyebrow')}
            </p>
            <h2 className="font-display text-4xl text-white sm:text-5xl">
              {t('home.signatureWork.title')}
            </h2>
            <p className="text-base leading-8 text-stone-300 sm:text-lg">
              {t('home.signatureWork.intro')}
            </p>
          </div>
          <SignatureWorkGrid />
          <div className="mt-10">
            <Link
              to="/gallery"
              className="text-sm tracking-wide text-stone-300 transition hover:text-amber-200"
            >
              {t('home.signatureWork.exploreAll')}
            </Link>
          </div>
        </div>
      </section>

      <InstagramWorkshopSection />

      <section id="reviews" className="dark-section w-full py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t('home.customerStories.eyebrow')}
            title={t('home.customerStories.title')}
            intro={t('home.customerStories.intro')}
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
              rel="noopener noreferrer"
              className={outlineButtonLightClassName}
            >
              {t('home.customerStories.readMore')}
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
                {t('home.meetTheMaker.eyebrow')}
              </p>
              <h2 className="font-display text-3xl text-white sm:text-4xl">
                {t('home.meetTheMaker.title')}
              </h2>
              <div className="space-y-4 text-base leading-8 text-stone-300">
                <p>{t('home.meetTheMaker.p1')}</p>
                <p>{t('home.meetTheMaker.p2')}</p>
                <p>{t('home.meetTheMaker.p3')}</p>
                <p>{t('home.meetTheMaker.p4')}</p>
                <p>{t('home.meetTheMaker.p5')}</p>
              </div>
              <p className="font-display text-xl text-stone-100">
                {t('home.meetTheMaker.tagline')}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryLink to="/gallery">
                  {t('home.meetTheMaker.ctaGallery')}
                </PrimaryLink>
                <SecondaryLink
                  to={CUSTOM_ORDER_FORM_ANCHOR}
                  variant="button"
                  className="text-center"
                >
                  {t('home.meetTheMaker.ctaCustom')}
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
              {t('home.partners.eyebrow')}
            </p>
            <h2 className="font-display text-2xl text-stone-100 sm:text-3xl">
              {t('home.partners.title')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {partnerItems.map((partner) => (
              <PartnerCard key={partner.name} partner={partner} compact />
            ))}
          </div>
          <div className="mt-6">
            <SecondaryLink to="/partners" className="text-stone-300 hover:text-amber-200">
              {t('home.partners.viewAll')}
            </SecondaryLink>
          </div>
        </div>
      </section>
    </>
  )
}

function MakerAboutImage({ className = '', priority = false }) {
  const { t } = useLocale()
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
        alt={t('home.meetTheMaker.portraitAlt')}
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
  const { t } = useLocale()
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
        alt={t('about.workshopImageAlt')}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0a09]/50 via-[#14100e]/10 to-transparent" />
    </div>
  )
}

function AvailablePiecesPage() {
  const { t } = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const materialParam = searchParams.get('material')
  const activeMaterial = isProductMaterialKey(materialParam) ? materialParam : null
  const [activeCollection, setActiveCollection] = useState('All')
  const { products: catalogueProducts } = usePublicCatalogue()
  const visibleCollections = ['All', ...getShopCollections(catalogueProducts)]
  const filteredProducts = activeMaterial
    ? catalogueProducts.filter((product) => getProductMaterialKey(product) === activeMaterial)
    : activeCollection === 'All'
      ? catalogueProducts
      : catalogueProducts.filter((product) => product.collection === activeCollection)

  const selectCollection = (collection) => {
    setActiveCollection(collection)
    if (activeMaterial) {
      setSearchParams({}, { replace: true })
    }
  }

  return (
    <>
      <PageMeta
        title={t('seo.availablePiecesTitle')}
        description={t('seo.availablePiecesDescription')}
      />
      <PageShell
        eyebrow={t('availablePiecesPage.eyebrow')}
        title={t('availablePiecesPage.title')}
        intro={t('availablePiecesPage.intro')}
      >
        <div className="mb-8 flex flex-wrap gap-2">
          {visibleCollections.map((collection) => {
            const isActive = !activeMaterial && activeCollection === collection

            return (
              <button
                key={collection}
                type="button"
                onClick={() => selectCollection(collection)}
                className={[
                  isActive
                    ? goldChipActiveClassName
                    : 'rounded-full border border-[rgba(212,170,86,0.22)] bg-[rgba(24,18,14,0.72)] px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:border-amber-200/40 hover:text-stone-100',
                ].join(' ')}
              >
                {collection === 'All' ? t('galleryPage.filterAll') : translateCategoryLabel(collection, t)}
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
  const location = useLocation()
  const { t, localize, locale, messages } = useLocale()
  const {
    isCzechia,
    localizeShippingNote,
  } = useCurrency()
  const redirectTarget = productId ? productIdRedirects[productId] : undefined
  const { product, loading, notFound, error: loadError } = usePublicProductDetail(
    productId || '',
  )
  const isDevUnpublishedPreview =
    Boolean(import.meta.env.DEV) && Boolean(product) && !isPublished(product)
  const rawImages = product ? getProductRealImages(product) : []
  const galleryImages = normalizeProductGallery(Array.isArray(rawImages) ? rawImages : [], {
    productName: product?.name || product?.title || 'Product',
    productId: product?.id || productId || 'product',
  })
  const primaryGalleryImage = galleryImages[0]?.url || ''
  const [activeIndex, setActiveIndex] = useState(0)
  // Lightbox stores a stable index into galleryImages — never a URL, DOM node, or product object.
  const [activeImageIndex, setActiveImageIndex] = useState(null)

  // Navigation reset: pathname / locale / slug change must not leak lightbox or gallery state.
  useEffect(() => {
    setActiveIndex(0)
    setActiveImageIndex(null)
  }, [location.pathname, product?.id, productId, locale])

  const safeActiveIndex =
    galleryImages.length === 0
      ? 0
      : Math.min(Math.max(activeIndex, 0), galleryImages.length - 1)
  const activeImage = galleryImages[safeActiveIndex]?.url || primaryGalleryImage
  const canNavigateGallery = galleryImages.length > 1

  const openLightboxAt = (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= galleryImages.length) return
    const image = galleryImages[index]
    if (!image || !hasValidProductImageUrl(image.url)) return
    setActiveIndex(index)
    setActiveImageIndex(index)
  }

  const showPreviousImage = () => {
    if (!canNavigateGallery) return
    setActiveIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
  }

  const showNextImage = () => {
    if (!canNavigateGallery) return
    setActiveIndex((current) => (current + 1) % galleryImages.length)
  }

  const navigateLightbox = (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= galleryImages.length) return
    if (!hasValidProductImageUrl(galleryImages[index]?.url)) return
    setActiveIndex(index)
    setActiveImageIndex(index)
  }

  if (redirectTarget) {
    return <Navigate to={localize(`/available-pieces/${redirectTarget}`)} replace />
  }

  if (loading) {
    return (
      <PageShell
        eyebrow={t('product.availablePieces')}
        title={t('product.loadingPiece')}
        intro={t('product.fetchingDetails')}
      />
    )
  }

  if (loadError && !product) {
    return (
      <PageShell
        eyebrow={t('product.availablePieces')}
        title={t('errors.catalogueUnavailable')}
        intro={t('errors.catalogueUnavailableIntro')}
      >
        <PrimaryLink to="/available-pieces">{t('common.backToAvailablePieces')}</PrimaryLink>
      </PageShell>
    )
  }

  if (!product || notFound || (!isPublished(product) && !isDevUnpublishedPreview)) {
    return (
      <PageShell
        eyebrow={t('product.availablePieces')}
        title={t('product.productNotFound')}
        intro={t('product.productNotFoundIntro')}
      >
        <PrimaryLink to="/available-pieces">{t('common.backToAvailablePieces')}</PrimaryLink>
      </PageShell>
    )
  }

  const primaryAction = getProductPrimaryAction(product)
  const secondaryAction = getProductSecondaryAction(product)
  const showBoardCareUpsell = product.careAddOnAvailable
  const socialProof = getProductSocialProof(product)
  const productOgImage = primaryGalleryImage || product.image || product.mainImage
  const detailSlug = product.slug || product.id
  const descriptionSource =
    product.description || product.longDescription || product.shortDescription || ''
  const parsedDescription = parseEtsyDescription(descriptionSource, {
    title: product.name || product.title,
  })
  const availabilityLabel = translateBadgeLabel(
    product.badge || product.availability || 'Available',
    t,
  )
  const productLabels = {
    overview: t('product.overview'),
    features: t('product.features'),
    perfectFor: t('product.perfectFor'),
    whyEndGrain: t('product.whyEndGrain'),
    whyThisPiece: t('product.whyThisPiece'),
    specifications: t('product.specifications'),
    materials: t('product.materials'),
    dimensions: t('product.dimensions'),
    finish: t('product.finish'),
    construction: t('product.construction'),
    woodSpecies: t('product.woodSpecies'),
    includedHardware: t('product.includedHardware'),
    intendedUse: t('product.intendedUse'),
    battery: t('product.battery'),
    ingredients: t('product.ingredients'),
    options: t('product.options'),
    capacity: t('product.capacity'),
    howToUse: t('product.howToUse'),
    intendedUseEpoxyServing: t('product.intendedUseEpoxyServing'),
    finishEpoxyServing: t('product.finishEpoxyServing'),
    careInstructions: t('product.careInstructions'),
    productDetails: t('product.productDetails'),
    importantNotes: t('product.importantNotes'),
    price: t('product.price'),
    availability: t('product.availability'),
    photos: t('product.photos'),
    photoSingular: t('product.photoSingular'),
    photoPlural: t('product.photoPlural'),
    handSelectedHardwoods: t('product.handSelectedHardwoods'),
    priceOnRequest: t('product.priceOnRequest'),
    perfectForEpoxyServingBoard: messages.product?.perfectForEpoxyServingBoard || [],
    perfectForBottleOpener: messages.product?.perfectForBottleOpener || [],
    perfectForBookHolder: messages.product?.perfectForBookHolder || [],
    typeContent: messages.product?.typeContent || {},
    careBullets: messages.product?.careBullets || {},
  }

  return (
    <>
      <PageMeta
        title={`${product.name} | Dom's Concepts`}
        description={
          parsedDescription.intro ||
          product.shortDescription ||
          product.longDescription ||
          product.description
        }
        ogImage={productOgImage}
        canonicalPath={`/available-pieces/${detailSlug}`}
      />
    <PageShell
      variant="product"
      eyebrow={t('product.availablePieces')}
      title={product.name}
    >
      {isDevUnpublishedPreview ? (
        <div className="mb-6 rounded-2xl border border-amber-300/40 bg-amber-950/50 px-4 py-3 text-sm text-amber-100">
          Unpublished preview ({product.publicationStatus}). Visible only in development —
          production returns 404.
        </div>
      ) : null}
      <div className="product-detail-layout">
        <div className="product-detail-hero">
          <div className="product-detail-gallery min-w-0">
            {galleryImages.length > 0 ? (
              <div className="product-gallery-hero relative">
                <PhotoFrame
                  src={activeImage}
                  alt={product.name}
                  className="product-gallery-main"
                  overlay="none"
                  priority
                  showLabels={false}
                  imageFit="contain"
                  onClick={() => openLightboxAt(safeActiveIndex)}
                />
                {canNavigateGallery ? (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="product-gallery-nav product-gallery-nav--prev"
                      aria-label={t('product.previousPhoto')}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="product-gallery-nav product-gallery-nav--next"
                      aria-label={t('product.nextPhoto')}
                    >
                      ›
                    </button>
                  </>
                ) : null}
              </div>
            ) : (
              <ProductDetailImageFallback productName={product.name} />
            )}
          </div>

          <div className="product-detail-purchase min-w-0">
            <Card className="product-detail-summary">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={[
                    'rounded-full border px-3 py-1.5 text-sm',
                    productBadgeClassesLuxury[product.badge] ||
                      productBadgeClassesLuxury.Available,
                  ].join(' ')}
                >
                  {availabilityLabel}
                </span>
                {product.freeShipping ? (
                  isCzechia ? (
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-950/40 px-3 py-1.5 text-sm text-emerald-200">
                      {t('shipping.freeCz')}
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-sm text-stone-300">
                      {t('shipping.calculatedDetail')}
                    </span>
                  )
                ) : null}
              </div>

              <ProductDetailPurchaseInfo
                product={product}
                labels={productLabels}
                locale={locale}
                priceValue={
                  <FormattedPrice
                    price={product.priceFrom || product.price}
                    amount={product.priceAmount}
                    sourceCurrency={product.priceCurrency}
                    className="text-stone-100"
                  />
                }
              />

              <div className="product-detail-purchase-actions mt-6 flex flex-col gap-3">
                {product.isAvailable ? (
                  <>
                    <ProductActionButton action={primaryAction} className={goldButtonClassName} />
                    <ProductActionButton
                      action={secondaryAction}
                      className={outlineButtonLightClassName}
                    />
                  </>
                ) : (
                  <ProductActionButton
                    action={secondaryAction}
                    className={outlineButtonLightClassName}
                  />
                )}
                <EtsyPriceNote className="product-detail-etsy-note mt-0.5" />
                <SecondaryLink to="/available-pieces" className="mt-1 self-start text-stone-400">
                  {t('common.backToCollection')}
                </SecondaryLink>
              </div>
              {showBoardCareUpsell ? <BoardCareUpsell product={product} /> : null}
            </Card>
          </div>

          {galleryImages.length > 1 ? (
            <div
              className="product-detail-thumbs product-thumbnails"
              role="list"
              aria-label={t('product.photos')}
            >
              {galleryImages.map((image, index) => (
                <GalleryThumbnail
                  key={`${product.id}-${image.id}`}
                  image={image.url}
                  alt={image.alt}
                  isActive={safeActiveIndex === index}
                  onSelect={() => openLightboxAt(index)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-detail-info-section min-w-0">
          <ProductDetailInfoGrid
            product={product}
            labels={productLabels}
            locale={locale}
          />

          {product.shippingNote ? (
            <Card className="mt-6">
              <h2 className="font-display text-2xl text-white sm:text-3xl">
                {t('product.returnsShipping')}
              </h2>
              <p className="product-description__body mt-5">
                {localizeShippingNote(product.shippingNote)}
              </p>
            </Card>
          ) : null}

          {socialProof ? <ProductSocialProof review={socialProof} /> : null}

          <div className="mt-8">
            <SecondaryLink to="/available-pieces" className="text-stone-400">
              {t('common.backToCollection')}
            </SecondaryLink>
          </div>
        </div>
      </div>
    </PageShell>
      <ProductImageLightbox
        images={galleryImages}
        activeImageIndex={activeImageIndex}
        onClose={() => setActiveImageIndex(null)}
        onNavigate={navigateLightbox}
      />
    </>
  )
}

function GalleryPage() {
  const { t, locale } = useLocale()
  const location = useLocation()
  const visibleProjects = getVisibleGalleryProjects(locale)

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')
    if (!hash) return undefined

    let frameId = 0
    let timeoutId = 0

    const scrollToHash = () => {
      const target = document.getElementById(hash)
      if (!target) return false
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return true
    }

    frameId = window.requestAnimationFrame(() => {
      if (scrollToHash()) return
      timeoutId = window.setTimeout(scrollToHash, 120)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [location.hash, visibleProjects])

  return (
    <>
      <PageMeta
        title={t('seo.galleryTitle')}
        description={t('seo.galleryDescription')}
      />
      <PageShell
        eyebrow={t('gallery.eyebrow')}
        title={t('gallery.title')}
        intro={t('gallery.intro')}
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
  const { t, messages } = useLocale()
  const [searchParams] = useSearchParams()
  const selectedProductId = searchParams.get('product') || ''
  const selectedProduct = products.find((item) => item.id === selectedProductId)
  const selectedPiece = selectedProduct?.name || selectedProductId
  const presetCareAddon = resolveBoardCareAddon(searchParams)

  return (
    <>
      <PageMeta
        title={t('seo.customOrdersTitle')}
        description={t('seo.customOrdersDescription')}
      />
      <PageShell
        eyebrow={t('customOrders.eyebrow')}
        title={t('customOrders.title')}
        intro={t('customOrders.intro')}
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <p className="section-eyebrow">{t('customOrdersPage.howItWorks')}</p>
            <h2 className="mt-4 font-display text-3xl text-stone-100">
              {t('customOrdersPage.quotedPersonally')}
            </h2>
            <p className="mt-4 leading-8 text-stone-300">{t('customOrdersPage.body')}</p>
            <div className="mt-6 space-y-4">
              {(messages.customOrdersPage?.steps || []).map((step, index) => (
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
                rel="noopener noreferrer"
                className={outlineButtonLightClassName}
              >
                {t('forms.messageOnInstagram')}
              </a>
            </div>
          </Card>
          <div id="custom-quote-form">
            <OrderForm
              title={t('forms.requestCustomQuote')}
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
  const { t, messages } = useLocale()
  return (
    <>
      <PageMeta title={t('seo.careGuideTitle')} description={t('seo.careGuideDescription')} />
      <PageShell
      eyebrow={t('careGuide.eyebrow')}
      title={t('careGuide.title')}
      intro={t('careGuide.intro')}
    >
      <div className="grid gap-6">
        <Card className="bg-white/[0.03]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                {t('careGuidePage.qrEyebrow')}
              </p>
              <p className="mt-3 text-lg leading-8 text-stone-300">
                {t('careGuidePage.qrBody')}
              </p>
            </div>
            <a
              href={etsyShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-stone-900 px-6 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-200 hover:bg-stone-800"
            >
              {t('careGuidePage.reorderButter')}
            </a>
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="font-serif text-3xl text-white">{t('careGuidePage.essentials')}</h2>
          <div className="mt-6 space-y-4">
            {(messages.careGuidePage?.points || []).map((point) => (
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
          <h2 className="font-serif text-3xl text-white">{t('careGuidePage.brandTitle')}</h2>
          <p className="mt-5 leading-8 text-stone-300">{t('careGuidePage.brandBody')}</p>
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
            {t('careGuidePage.avoidNote')}
          </div>
        </Card>
      </div>
      <Card className="mt-8 bg-gradient-to-r from-amber-200/10 via-stone-900/80 to-black/80">
        <div className="flex flex-col gap-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              {t('careGuidePage.addonEyebrow')}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-white">{t('careGuidePage.needCare')}</h2>
            <p className="mt-4 leading-8 text-stone-300">
              {t('careGuidePage.addonBody', { discount: boardCarePricing.discountLabel })}
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
  const { t } = useLocale()
  return (
    <PageShell
      eyebrow={t('partnersPage.eyebrow')}
      title={t('partnersPage.title')}
      intro={t('partnersPage.intro')}
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
                {t('partnersPage.partnershipEyebrow')}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-white">
                {t('partnersPage.partnershipTitle')}
              </h2>
            </div>
            <PrimaryLink to="/contact">{t('partnersPage.startConversation')}</PrimaryLink>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

function AboutMeetTheMaker() {
  const { t } = useLocale()
  return (
    <div className="mb-14 border-b border-[rgba(212,170,86,0.14)] pb-14 sm:mb-16 sm:pb-16">
      <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 xl:gap-20">
        <div className="mx-auto w-full max-w-[17.5rem] sm:max-w-[19rem] lg:mx-0 lg:max-w-[21rem]">
          <div className="about-maker-portrait relative aspect-[4/5] overflow-hidden rounded-[1.35rem] border border-[rgba(212,170,86,0.38)] bg-[#1a1511] shadow-[0_0_32px_-10px_rgba(212,170,86,0.42),0_18px_40px_-28px_rgba(0,0,0,0.7)]">
            <img
              src={aboutMakerPortraitPath}
              alt={t('about.maker.portraitAlt')}
              loading="eager"
              className="h-full w-full object-cover object-[center_18%]"
            />
          </div>
        </div>

        <div className="mx-auto max-w-xl space-y-5 text-center lg:mx-0 lg:max-w-none lg:text-left">
          <p className="text-[11px] uppercase tracking-[0.38em] text-amber-200/80">
            {t('about.maker.eyebrow')}
          </p>
          <h2 className="font-display text-3xl text-[#f7efe3] sm:text-4xl">
            {t('about.maker.name')}
          </h2>
          <div className="space-y-4 text-base leading-8 text-stone-300">
            <p>{t('about.maker.p1')}</p>
            <p>{t('about.maker.p2')}</p>
            <p>{t('about.maker.p3')}</p>
            <p>{t('about.maker.p4')}</p>
          </div>
          <p className="font-display text-lg text-stone-200 sm:text-xl">
            {t('about.maker.tagline')}
          </p>
        </div>
      </div>
    </div>
  )
}

function AboutPage() {
  const { t } = useLocale()
  return (
    <>
      <PageMeta title={t('seo.aboutTitle')} description={t('seo.aboutDescription')} />
      <PageShell
      eyebrow={t('about.eyebrow')}
      title={t('about.title')}
      intro={
        <>
          {t('about.introP1')}
          <span className="mt-3 block">{t('about.introP2')}</span>
        </>
      }
    >
      <AboutMeetTheMaker />
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
            {t('about.brand.eyebrow')}
          </p>
          <div className="space-y-5 leading-8 text-stone-300">
            <p>{t('about.brand.p1')}</p>
            <p>{t('about.brand.p2', { shop: etsyShopName })}</p>
            <p className="text-stone-200">{t('about.brand.p3')}</p>
          </div>
        </Card>
        <div className="space-y-6">
          <WorkshopAboutImage className="aspect-[5/4] w-full" priority />
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat value="2016" label={t('about.stats.since')} />
            <Stat value={t('about.stats.locationValue')} label={t('about.stats.location')} />
            <Stat value={t('about.stats.trustedValue')} label={t('about.stats.trusted')} />
            <Stat value={t('about.stats.onEtsyValue')} label={t('about.stats.onEtsy')} />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <Card className="bg-white/[0.03]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                {t('about.etsyStrip.eyebrow')}
              </p>
              <p className="mt-3 max-w-3xl leading-8 text-stone-300">
                {t('about.etsyStrip.body')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={etsyShopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-stone-900 px-6 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-200 hover:bg-stone-800"
              >
                {t('about.etsyStrip.viewShop')}
              </a>
              {import.meta.env.DEV ? (
                <a
                  href="/api/etsy/oauth/start"
                  className="inline-flex items-center justify-center rounded-full border border-dashed border-stone-500 px-6 py-3 text-sm font-medium text-stone-400 transition hover:border-stone-300 hover:text-stone-200"
                >
                  Connect Etsy
                </a>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
    </>
  )
}

function ReviewsPage() {
  const { t, messages } = useLocale()
  return (
    <>
      <PageMeta title={t('seo.reviewsTitle')} description={t('seo.reviewsDescription')} />
      <PageShell
        eyebrow={t('reviews.eyebrow')}
        title={t('reviews.title')}
        intro={t('reviews.intro')}
      >
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(messages.reviewsPage?.trustPoints || []).map((point) => (
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
            rel="noopener noreferrer"
            className={outlineButtonLightClassName}
          >
            {t('reviewsPage.readMore')}
          </a>
        </div>
      </PageShell>
    </>
  )
}

function FaqPage() {
  const { t, messages } = useLocale()
  return (
    <>
      <PageMeta title={t('seo.faqTitle')} description={t('seo.faqDescription')} />
      <PageShell
        eyebrow={t('faq.eyebrow')}
        title={t('faq.title')}
        intro={t('faq.intro')}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {(messages.faqItems || []).map((item) => (
            <FaqCard key={item.question} item={item} />
          ))}
        </div>
        <div className="mt-10">
          <PrimaryLink to="/contact">{t('faqPage.askQuestion')}</PrimaryLink>
        </div>
      </PageShell>
    </>
  )
}

function LegalDocumentPage({ slug }) {
  const { t } = useLocale()
  const page = legalPages.find((item) => item.slug === slug)

  if (!page) {
    return (
      <PageShell
        eyebrow={t('brand.legal')}
        title={t('common.pageNotFound')}
        intro={t('common.pageNotFoundIntro')}
      >
        <PrimaryLink to="/">{t('nav.home')}</PrimaryLink>
      </PageShell>
    )
  }

  return (
    <>
      <PageMeta
        title={`${page.title} | Dom's Concepts`}
        description={page.intro}
      />
      <PageShell eyebrow={t('brand.legal')} title={page.title} intro={page.intro}>
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

function isExternalHttpUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim())
}

function PartnerCard({ partner, compact = false }) {
  const hasUrl = isExternalHttpUrl(partner.url)
  const { t } = useLocale()
  const visitLabel = hasUrl ? t('partnersPage.visitPartner') : t('partnersPage.workshopPartner')

  if (compact) {
    const className =
      'group flex min-h-[11.5rem] flex-col rounded-2xl border border-amber-200/20 bg-stone-900/90 px-4 py-4 text-center transition hover:border-amber-200/45 hover:bg-stone-800'
    const body = (
      <>
        <PartnerLogo partner={partner} compact />
        <span className="font-medium text-amber-50 transition group-hover:text-amber-100">
          {partner.name}
        </span>
        <span className="mt-auto pt-3 text-[10px] uppercase tracking-[0.18em] text-stone-500 transition group-hover:text-amber-200/80">
          {visitLabel}
        </span>
      </>
    )
    if (!hasUrl) {
      return <div className={className}>{body}</div>
    }
    return (
      <a href={partner.url} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    )
  }

  const className =
    'group flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/[0.05]'
  const body = (
    <>
      <PartnerLogo partner={partner} />
      <h2 className="font-serif text-2xl text-white transition group-hover:text-amber-100">
        {partner.name}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-7 text-stone-300">
        {partner.description}
      </p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-stone-500 transition group-hover:text-amber-200/80">
        {visitLabel}
      </p>
    </>
  )
  if (!hasUrl) {
    return <div className={className}>{body}</div>
  }
  return (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
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

function InstagramWorkshopSection() {
  const { t, locale } = useLocale()
  const videos = getInstagramVideos(locale)
  return (
    <section id="follow-the-workshop" className="dark-section scroll-mt-28 w-full py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('home.instagram.eyebrow')}
          title={t('home.instagram.title')}
          intro={t('home.instagram.intro')}
          compact
        />
        <div className="grid gap-5 md:grid-cols-3">
          {videos.map((video) => (
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
            {t('home.instagram.followCta')}
          </a>
        </div>
      </div>
    </section>
  )
}

function InstagramVideoCard({ video }) {
  const { t } = useLocale()
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
          {t('home.instagram.reelLabel')}
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
          {t('home.instagram.watchCta')}
        </a>
      </div>
    </article>
  )
}

function ContactPage() {
  const { t } = useLocale()
  return (
    <PageShell
      eyebrow={t('contact.eyebrow')}
      title={t('contact.title')}
      intro={t('contact.intro')}
    >
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="font-serif text-3xl text-white">{t('forms.directContact')}</h2>
          <div className="mt-6 space-y-4 text-stone-300">
            <p>{t('forms.emailLabel')}</p>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block text-lg text-amber-200 transition hover:text-amber-100"
            >
              {contactEmail}
            </a>
            <p className="pt-4 leading-8">{t('forms.basedInPrague')}</p>
            <a
              href={etsyShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-stone-200 transition hover:text-amber-200"
            >
              Etsy: {etsyShopName}
            </a>
          </div>
        </Card>
        <OrderForm title={t('forms.sendEnquiry')} />
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
  const { t } = useLocale()
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
            {t('boardCare.normalPrice')}{' '}
            <FormattedPrice price={boardCarePricing.normalPrice} className="text-stone-200" />
          </p>
          <p className="mt-1">
            {t('boardCare.addonPrice')}{' '}
            <FormattedPrice
              price={boardCarePricing.addonPrice}
              className="font-medium text-amber-100"
            />
          </p>
        </div>
        {compact ? null : (
          <p className="text-sm leading-7 text-stone-300">{product.description}</p>
        )}
        <div className="mt-auto pt-2">
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
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
  const { t } = useLocale()
  const etsyHref = getProductEtsyHref(product)
  const purchaseOptions = [
    { label: t('boardCare.chooseButter'), href: etsyHref, outline: false },
    { label: t('boardCare.chooseWax'), href: etsyHref, outline: false },
    { label: t('boardCare.buyWithout'), href: etsyHref, outline: true },
  ]

  return (
    <div className="mt-8 rounded-[1.4rem] border border-amber-200/20 bg-gradient-to-br from-[#1c1511] via-stone-950 to-black p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
        {t('boardCare.workshopRecommendation')}
      </p>
      <h2 className="mt-3 font-serif text-2xl text-white">{t('boardCare.addBoardCare')}</h2>
      <p className="mt-3 text-sm leading-7 text-stone-300">
        {t('boardCare.addBoardCareBody')}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {purchaseOptions.map((option) => (
          <a
            key={option.label}
            href={option.href}
            target="_blank"
            rel="noopener noreferrer"
            className={option.outline ? outlineButtonLightClassName : goldButtonClassName}
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
      className="h-full w-full object-cover object-center transition duration-500 motion-safe:group-hover:scale-[1.03]"
    />
  )
}

function ProductActionButton({ action, className = goldButtonClassNameCompact }) {
  const { t, localize } = useLocale()
  const label = translateActionLabel(action.label, t)
  const href = action.href.startsWith('/') ? localize(action.href) : action.href

  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    )
  }

  if (action.href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    )
  }

  return (
    <a href={action.href} className={className}>
      {label}
    </a>
  )
}

function ProductCard({ piece, variant = 'luxury' }) {
  const { t, localize } = useLocale()
  const { isCzechia, shippingMessage } = useCurrency()
  const isLuxury = variant === 'luxury'
  const badgeLabel = translateBadgeLabel(piece.badge || 'Available', t)
  const detailHref = localize(getProductDetailHref(piece))
  // Same helper as Available Pieces + detail: Etsy-first when catalogue mode is on.
  const cardImage = getProductRealImages(piece)[0] || piece.image || piece.mainImage

  return (
    <article
      className={[
        isLuxury ? 'luxury-shop-card' : 'shop-card',
        'group flex h-full flex-col',
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
          <ProductCardImage src={cardImage} alt={piece.name} />
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
          <FormattedPrice
            price={piece.priceFrom || piece.price}
            amount={piece.priceAmount}
            sourceCurrency={piece.priceCurrency}
            className="text-base font-medium text-stone-200"
            as="p"
          />
          {piece.freeShipping ? (
            <p
              className={[
                'text-[11px] uppercase tracking-[0.18em]',
                isCzechia ? 'text-emerald-400/85' : 'text-stone-500',
              ].join(' ')}
            >
              {shippingMessage
                ? isCzechia
                  ? t('shipping.freeCz')
                  : t('shipping.calculatedShort')
                : null}
            </p>
          ) : null}
          <Link
            to={detailHref}
            className="product-card-view-link text-xs uppercase tracking-[0.18em] text-amber-200/80 transition duration-300"
          >
            {t('common.viewPiece')}
          </Link>
        </div>
      </div>
    </article>
  )
}

function ReviewCard({ review, luxury = false }) {
  const { t } = useLocale()
  const cardClassName = luxury ? 'luxury-review-card' : 'premium-card h-full p-6'

  return (
    <article className={cardClassName}>
      <div
        className="flex gap-1 text-amber-200/90"
        aria-label={`${review.rating} ${t('socialProof.outOfFive')}`}
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
  const { t } = useLocale()
  if (!review || typeof review !== 'object') return null
  const rating = Number.isFinite(Number(review.rating)) ? Number(review.rating) : 0
  const quote = review.shortQuote || review.quote || ''
  const name = review.name || ''

  return (
    <div className="product-social-proof mt-6">
      <p className="text-sm leading-7 text-stone-200">
        <span
          className="text-amber-200/90"
          aria-label={`${rating} ${t('socialProof.outOfFive')}`}
        >
          {Array.from({ length: Math.max(0, Math.min(5, rating)) })
            .map(() => '★')
            .join('')}
        </span>{' '}
        &ldquo;{quote}&rdquo; — {name}, {t('socialProof.verifiedReview')}
      </p>
    </div>
  )
}

function OrderForm({ title, presetProduct = '', presetCareAddon = 'none', defaultMessage = '' }) {
  const { locale, t } = useLocale()
  const { formatProductPrice, pricesReady } = useCurrency()
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    product: presetProduct,
    productType: customProductTypeOptions[0].value,
    woodPreference: 'none',
    size: '',
    engraving: 'no',
    shipping: 'pickup',
    budget: budgetRangeChoices[1].value,
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

  const formattedAddonPrice = pricesReady
    ? formatProductPrice(boardCarePricing.addonPrice)
    : boardCarePricing.addonPrice
  const formattedNormalPrice = pricesReady
    ? formatProductPrice(boardCarePricing.normalPrice)
    : boardCarePricing.normalPrice

  const mailtoHref = useMemo(() => {
    const subject = formState.product
      ? `Dom's Concepts enquiry: ${formState.product}`
      : "Dom's Concepts enquiry"
    const careLabel = getBoardCareAddonLabel(formState.boardCareAddon)
    const carePriceNote =
      formState.boardCareAddon === 'wood-butter' || formState.boardCareAddon === 'wood-wax'
        ? ` (${formattedAddonPrice} board add-on price, normally ${formattedNormalPrice})`
        : ''
    const localeLabel = locale === 'de' ? 'de' : locale === 'cs' ? 'cs' : 'en'

    const body = [
      `Website language: ${localeLabel}`,
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
  }, [formState, formattedAddonPrice, formattedNormalPrice, locale])

  function updateField(event) {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  return (
    <Card>
      <h2 className="font-display text-3xl text-stone-100">{title}</h2>
      <p className="mt-4 leading-8 text-stone-300">
        {t('forms.opensEmail', { email: contactEmail })}
      </p>

      {presetProduct ? (
        <div className="form-highlight mt-6">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80">
            {t('forms.selectedProduct')}
          </p>
          <p className="mt-2 text-lg text-stone-100">{presetProduct}</p>
        </div>
      ) : null}

      {presetCareAddon !== 'none' ? (
        <div className="form-highlight-muted mt-4">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/85">
            {t('forms.boardCareAddon')}
          </p>
          <p className="mt-2 text-sm text-stone-200">
            {getBoardCareAddonLabel(presetCareAddon)}
            {presetCareAddon === 'wood-butter' || presetCareAddon === 'wood-wax'
              ? ` · ${formattedAddonPrice} (normally ${formattedNormalPrice})`
              : ''}
          </p>
        </div>
      ) : null}

      <form className="mt-8 grid gap-5" action={mailtoHref} method="get">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label={t('forms.yourName')}
            name="name"
            autoComplete="name"
            value={formState.name}
            onChange={updateField}
            required
          />
          <FormField
            label={t('forms.yourEmail')}
            name="email"
            type="email"
            autoComplete="email"
            value={formState.email}
            onChange={updateField}
            required
          />
        </div>
        <SelectField
          label={t('forms.productType')}
          name="productType"
          autoComplete="off"
          value={formState.productType}
          onChange={updateField}
          options={customProductTypeOptions.map((o) => t(o.labelKey))}
          optionValues={customProductTypeOptions.map((o) => o.value)}
        />
        <FormField
          label={t('forms.productNameOptional')}
          name="product"
          autoComplete="off"
          value={formState.product}
          onChange={updateField}
        />
        <SelectField
          label={t('forms.budgetRange')}
          name="budget"
          autoComplete="off"
          value={formState.budget}
          onChange={updateField}
          options={budgetRangeChoices.map((o) => t(o.labelKey))}
          optionValues={budgetRangeChoices.map((o) => o.value)}
        />
        <div className="grid gap-2">
          <label className="form-label" htmlFor="message">
            {t('forms.message')}
          </label>
          <textarea
            id="message"
            name="message"
            rows="5"
            autoComplete="off"
            value={formState.message}
            onChange={updateField}
            className="form-textarea"
          />
        </div>
        <div className="form-note">{t('forms.referenceImageNote')}</div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" className={goldButtonClassName}>
            {t('forms.requestCustomQuote')}
          </button>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={outlineButtonLightClassName}
          >
            {t('forms.messageOnInstagram')}
          </a>
        </div>
      </form>
    </Card>
  )
}

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete,
}) {
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
        autoComplete={autoComplete}
        className="form-input"
      />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options, optionValues, autoComplete }) {
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
        autoComplete={autoComplete}
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

function ProductPriceMeta({ priceFrom, price, priceAmount, priceCurrency }) {
  const label = priceFrom || price
  return (
    <ProductMeta
      label="Price"
      value={
        <FormattedPrice
          price={label}
          amount={priceAmount}
          sourceCurrency={priceCurrency}
          className="text-stone-100"
        />
      }
    />
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
      className="product-gallery-main relative flex items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/10 shadow-[inset_0_1px_0_rgba(251,191,36,0.07),0_18px_40px_-28px_rgba(0,0,0,0.85)]"
      aria-label={`${productName} photo coming soon`}
    >
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
      role="listitem"
      onClick={onSelect}
      className={[
        'product-thumbnail overflow-hidden rounded-[1.2rem] border transition',
        isActive
          ? 'border-[rgba(212,170,86,0.85)] ring-1 ring-[rgba(212,170,86,0.45)]'
          : 'border-white/10 hover:border-[rgba(212,170,86,0.45)]',
      ].join(' ')}
      aria-pressed={isActive}
    >
      <img
        src={image}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover object-center"
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
  onClick,
}) {
  const [hasError, setHasError] = useState(false)
  const isContained = imageFit === 'contain'
  const hasUsableSrc = typeof src === 'string' && src.trim().length > 0
  const isClickable = typeof onClick === 'function' && hasUsableSrc && !hasError

  useEffect(() => {
    setHasError(false)
  }, [src])

  return (
    <div
      className={[
        'relative overflow-hidden rounded-[1.6rem] border border-white/10',
        isContained
          ? 'bg-[#0d0b09] shadow-[inset_0_1px_0_rgba(251,191,36,0.07),0_18px_40px_-28px_rgba(0,0,0,0.85)]'
          : 'bg-stone-900',
        isClickable ? 'cursor-zoom-in' : '',
        className,
      ].join(' ')}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `Open larger view of ${alt}` : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {!hasError && hasUsableSrc ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={[
            isContained
              ? 'relative z-[1] h-full w-full object-contain object-center p-2 sm:p-3'
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
  const { localize } = useLocale()
  return (
    <Link
      to={localize(to)}
      className={[goldButtonClassName, className].join(' ')}
    >
      {children}
    </Link>
  )
}

function SecondaryLink({ to, children, className = '', variant = 'text' }) {
  const { localize } = useLocale()
  const baseClassName =
    variant === 'button'
      ? outlineButtonClassName
      : 'inline-flex items-center text-sm font-medium text-amber-200/90 transition hover:text-amber-100'

  return (
    <Link to={localize(to)} className={[baseClassName, className].join(' ')}>
      {children}
      {variant === 'text' ? ' →' : ''}
    </Link>
  )
}

export default App
