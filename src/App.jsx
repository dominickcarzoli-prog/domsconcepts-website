import { useEffect, useMemo, useState } from 'react'
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
  boardCareAddonOptions,
  boardCarePricing,
  boardCareProductAddonOptions,
  boardCareProducts,
  budgetRanges,
  careGuidePoints,
  customOrderSteps,
  engravingOptions,
  faqItems,
  featuredCategories,
  galleryItems,
  getBoardCareAddonLabel,
  isBoardCareEligible,
  legalPages,
  navItems,
  pageSeo,
  partnerItems,
  resolveBoardCareAddon,
  shippingOptions,
  woodPreferences,
  workshopVideos,
  youtubeChannelUrl,
} from './siteData'
import { productCategories, products, productIdRedirects, sortedProducts } from './data/products'

const contactEmail = 'hello@domsconcepts.com'
const instagramHandle = '@doms_concepts'
const instagramUrl = 'https://instagram.com/doms_concepts'
const etsyShopName = 'DomsConcepts'
const etsyShopUrl = 'https://www.etsy.com/shop/DomsConcepts'
const icoNumber = '14010615'
const logoImagePath = '/images/doms-concepts-logo.png' // Replace with the final navbar logo if this file changes.
// hero-workshop-board.jpg = main homepage hero product/workshop image
const heroImagePath = '/images/hero-workshop-board.jpg'
// workshop-process.jpg = small Prague workshop/process image
const aboutImagePath = '/images/workshop-process.jpg'
const workshopStoryImagePath = '/images/workshop-process.jpg'
const footerLinks = [
  { label: 'Contact', path: '/contact' },
  { label: 'Care Guide', path: '/care-guide' },
  { label: 'Custom Orders', path: '/custom-orders' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Workshop Partners', path: '/partners' },
]
const productStatusClasses = {
  Available: 'border-emerald-300/35 bg-emerald-950/85 text-emerald-100',
  Reserved: 'border-amber-300/35 bg-amber-950/85 text-amber-100',
  Sold: 'border-stone-500/50 bg-stone-900 text-stone-200',
  'Made to order': 'border-sky-300/35 bg-sky-950/85 text-sky-100',
  'Low in stock, only 1 left': 'border-rose-300/35 bg-rose-950/85 text-rose-100',
  'Low in stock, only 2 left': 'border-rose-300/35 bg-rose-950/85 text-rose-100',
  'Low in stock, only 5 left': 'border-rose-300/35 bg-rose-950/85 text-rose-100',
}
const goldButtonClassName = 'btn-gold gold-button px-6 py-3 text-sm'
const goldButtonClassNameCompact = 'btn-gold gold-button px-4 py-2 text-xs'
const goldChipActiveClassName =
  'chip-gold-active rounded-full border px-3 py-1.5 text-xs font-medium'

function PageMeta({ title, description }) {
  useEffect(() => {
    document.title = title

    let meta = document.querySelector('meta[name="description"]')

    if (meta) {
      meta.setAttribute('content', description)
      return
    }

    meta = document.createElement('meta')
    meta.name = 'description'
    meta.content = description
    document.head.appendChild(meta)
  }, [description, title])

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
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-stone-950/88 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3.5 lg:gap-4">
            <BrandMark />
            <div className="min-w-0 pt-0.5">
              <p className="truncate font-serif text-[0.98rem] leading-none tracking-[0.01em] text-white sm:text-[1.08rem] lg:text-[1.22rem]">
                Dom&apos;s Concepts
              </p>
              <p className="mt-1 truncate text-[10px] uppercase tracking-[0.24em] text-stone-300 sm:text-[11px]">
                Handmade in Prague
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="rounded-full border border-amber-200/35 bg-stone-900 px-4 py-2 text-sm font-medium text-amber-50 transition hover:border-amber-200 hover:bg-stone-800 lg:hidden"
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
          <Route path="custom-orders" element={<CustomOrdersPage />} />
          <Route path="care-guide" element={<CareGuidePage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FaqPage />} />
          {legalPages.map((page) => (
            <Route
              key={page.slug}
              path={page.path.replace(/^\//, '')}
              element={<LegalDocumentPage slug={page.slug} />}
            />
          ))}
        </Routes>
      </main>

      <footer className="border-t border-white/10 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_1fr]">
            <div className="space-y-4">
              <p className="font-serif text-2xl text-white">Dom&apos;s Concepts</p>
              <p className="text-sm uppercase tracking-[0.3em] text-stone-400">
                Handmade woodworking in Prague
              </p>
              <a
                className="inline-block text-stone-200 transition hover:text-amber-200"
                href={`mailto:${contactEmail}`}
              >
                Email: {contactEmail}
              </a>
            </div>

            <div className="space-y-4 text-sm text-stone-300">
              <p className="text-white">Links</p>
              <div className="grid gap-3">
                {footerLinks.map((item) => (
                  <Link key={item.path} to={item.path} className="transition hover:text-amber-200">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-sm text-stone-300">
              <p className="text-white">Studio Notes</p>
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="block transition hover:text-amber-200">
                Instagram: {instagramHandle}
              </a>
              <a href={etsyShopUrl} target="_blank" rel="noreferrer" className="block transition hover:text-amber-200">
                Etsy: {etsyShopName}
              </a>
              <p>IČO: {icoNumber}</p>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="text-sm text-white">Legal</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-400">
              {legalPages.map((page) => (
                <Link key={page.slug} to={page.path} className="transition hover:text-amber-200">
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

function BrandMark() {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return null
  }

  return (
    <img
      src={logoImagePath}
      alt="Dom's Concepts logo"
      loading="eager"
      onError={() => setHasError(true)}
      className="h-auto w-12 shrink-0 object-contain sm:w-[3.4rem] lg:w-[4.1rem]"
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
          isActive ? 'text-amber-200' : 'text-stone-300 hover:text-white',
          mobile ? 'border border-amber-200/20 bg-stone-900/90 text-amber-50' : '',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  )
}

function PageShell({ eyebrow, title, intro, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 max-w-3xl space-y-4 sm:space-y-5">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          {eyebrow}
        </p>
        <h1 className="font-serif text-[2.2rem] leading-[1.08] text-white sm:text-[2.9rem] lg:text-[3.6rem]">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-300 sm:text-lg sm:leading-8">{intro}</p>
      </div>
      {children}
    </section>
  )
}

function HomePage() {
  const featuredProducts = sortedProducts
    .filter(
      (piece) =>
        piece.status === 'Available' || piece.status.startsWith('Low in stock'),
    )
    .slice(0, 4)

  return (
    <>
      <PageMeta title={pageSeo.home.title} description={pageSeo.home.description} />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_36%),linear-gradient(180deg,_rgba(28,25,23,0.7),_rgba(12,10,9,0.96))]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-18 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              Premium Handmade Woodworking Since 2016
            </p>
            <div className="space-y-6">
              <h1 className="max-w-3xl font-serif text-[2.8rem] leading-[1.04] text-white sm:text-[3.8rem] lg:text-[4.7rem]">
                Handmade wooden pieces built with care in Prague.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-300">
                End grain cutting boards, edge grain cutting boards, butcher
                blocks, serving boards, breadboards, coasters, wood butter, and
                custom handmade pieces made from premium hardwoods.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <PrimaryLink to="/custom-orders">Request Custom Order</PrimaryLink>
              <SecondaryLink to="/available-pieces">View Available Pieces</SecondaryLink>
            </div>
          </div>

          <PhotoFrame
            src={heroImagePath}
            alt="Handmade end grain cutting board from Dom's Concepts"
            className="aspect-[5/4] w-full sm:aspect-[4/3]"
            overlay="none"
            showLabels={false}
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Categories"
          title="Built for everyday use and made to age beautifully."
          intro="A focused collection of kitchen and serving pieces designed with premium hardwoods, clean detailing, and a warm handmade finish."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredCategories.map((category) => (
            <Card key={category.name}>
              <PhotoFrame
                src={category.image}
                alt={category.name}
                label={category.name}
                className="mb-5 h-40"
                overlay="dark"
              />
              <h3 className="font-serif text-2xl text-white">{category.name}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Crafted for daily use, gifting, restaurant service, and custom
                logo projects with a premium handmade finish.
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              Workshop Story
            </p>
            <h2 className="font-serif text-3xl text-white sm:text-4xl">
              Handmade in a small Prague workshop since 2016.
            </h2>
            <PhotoFrame
              src={workshopStoryImagePath}
              alt="Dom's Concepts workshop in Prague"
              className="mt-6 aspect-[5/4] w-full sm:aspect-[16/10]"
              overlay="none"
              showLabels={false}
              placeholderMessage="Workshop photo coming soon"
            />
          </div>
          <div className="space-y-5 text-base leading-8 text-stone-300">
            <p>
              Dom&apos;s Concepts began with a simple idea: create woodworking
              pieces that feel substantial, honest, and personal. Every board,
              tray, and custom build is shaped with close attention to grain,
              balance, durability, and finish.
            </p>
            <p>
              The brand works from a compact city workshop in Prague, producing
              small-batch collections as well as tailored pieces for homes,
              gifts, and hospitality spaces.
            </p>
            <p className="text-amber-100">
              Custom sizes, wood combinations, logo engraving, and special
              pieces are available on request.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Custom Order Process"
          title="A clear process from first idea to finished piece."
          intro="Each project is quoted personally, shaped around the wood, dimensions, and details that fit your use."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {customOrderSteps.map((step, index) => (
            <Card key={step} className="relative pt-12">
              <span className="absolute left-6 top-6 text-sm uppercase tracking-[0.3em] text-amber-200/80">
                0{index + 1}
              </span>
              <h3 className="font-serif text-2xl text-white">{step}</h3>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 pb-16 sm:px-6 lg:px-8">
        <Card className="bg-gradient-to-r from-amber-200/10 via-stone-900/75 to-black/85">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                Trusted by Etsy customers
              </p>
              <h2 className="mt-3 font-serif text-3xl text-white">
                Trusted by Etsy customers
              </h2>
              <p className="mt-4 leading-8 text-stone-300">
                Dom&apos;s Concepts also sells handmade pieces through Etsy and
                has received 5-star customer feedback for craftsmanship,
                service, and wood care products.
              </p>
            </div>
            <a
              href={etsyShopUrl}
              target="_blank"
              rel="noreferrer"
              className={goldButtonClassName}
            >
              View Etsy Shop
            </a>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Card className="bg-white/[0.03]">
          <div className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                5-star feedback from Etsy customers
              </p>
              <h2 className="mt-3 font-serif text-3xl text-white">
                5-star feedback from Etsy customers
              </h2>
              <p className="mt-4 leading-8 text-stone-300">
                Dom&apos;s Concepts has received 5-star feedback from Etsy customers
                for handmade boards, wood butter, shipping, and service.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                'VERY NICE ITEM, WOULD PURCHASE AGAIN',
                'Great love the butter it got a lovely smell',
                'Crazy fast shipping!',
              ].map((review) => (
                <div
                  key={review}
                  className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5"
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-amber-50">
                    {review}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <a
                href={etsyShopUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-stone-900 px-6 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-200 hover:bg-stone-800"
              >
                View all Etsy reviews
              </a>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Available from the workshop"
            title="Pieces ready to reserve now."
            intro="A quick look at what is currently available. Open any piece for photos, dimensions, and full details."
            compact
          />
          <SecondaryLink to="/available-pieces">View all available pieces</SecondaryLink>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((piece) => (
            <ProductCard key={piece.id} piece={piece} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Card className="bg-transparent p-0 shadow-none">
            <div className="space-y-5 p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                Care Guide
              </p>
              <h2 className="font-serif text-3xl text-white">
                Keep hardwood pieces rich, smooth, and ready for daily use.
              </h2>
              <p className="leading-8 text-stone-300">
                The full care guide covers washing, drying, storage, and how to
                refresh each piece with Dom&apos;s Concepts wood butter.
              </p>
              <SecondaryLink to="/care-guide">Read the full care guide</SecondaryLink>
            </div>
          </Card>

          <Card className="bg-transparent p-0 shadow-none">
            <div className="space-y-5 p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                Workshop Partners
              </p>
              <h2 className="font-serif text-3xl text-white">
                Trusted workshop brands and collaborators.
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {partnerItems.map((partner) => (
                  <PartnerCard key={partner.name} partner={partner} compact />
                ))}
              </div>
              <SecondaryLink to="/partners">View all partners</SecondaryLink>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Board care"
          title="Need board care?"
          intro="Add Dom's Concepts wood butter or wood wax to any board order and save 30% on care products."
          compact
        />
        <BoardCareProductsGrid />
        <div className="mt-8">
          <SecondaryLink to="/care-guide">Read the full care guide</SecondaryLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions, answered simply."
          intro="A quick overview of custom work, shipping, and care. Full answers are on the FAQ page."
          compact
        />
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.slice(0, 4).map((item) => (
            <FaqCard key={item.question} item={item} />
          ))}
        </div>
        <div className="mt-8">
          <SecondaryLink to="/faq">View all questions</SecondaryLink>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="From the workshop"
              title="Short films and behind-the-scenes moments."
              intro="Workshop builds, board care, and custom piece previews — shared on YouTube without loading heavy embeds here."
              compact
            />
            <a
              href={youtubeChannelUrl}
              target="_blank"
              rel="noreferrer"
              className={goldButtonClassName}
            >
              Visit YouTube Channel
            </a>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {workshopVideos.map((video) => (
              <WorkshopVideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function AvailablePiecesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const filteredProducts = activeCategory === 'All'
    ? sortedProducts
    : sortedProducts.filter((product) => product.category === activeCategory)

  return (
    <>
      <PageMeta
        title={pageSeo.availablePieces.title}
        description={pageSeo.availablePieces.description}
      />
      <PageShell
      eyebrow="Available Pieces"
      title="Browse handmade pieces from the workshop."
      intro="A compact overview of current work. Select a piece to see the full gallery, specifications, and reservation details."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {['All', ...productCategories].map((category) => {
          const isActive = activeCategory === category

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={[
                isActive
                  ? goldChipActiveClassName
                  : 'rounded-full border border-white/10 bg-stone-900/70 px-3 py-1.5 text-xs font-medium text-stone-300 transition hover:border-amber-200/35 hover:text-amber-50',
              ].join(' ')}
            >
              {category}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filteredProducts.map((piece) => (
          <ProductCard key={piece.id} piece={piece} />
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
  const [activeImage, setActiveImage] = useState(product?.mainImage || '')

  useEffect(() => {
    setActiveImage(product?.mainImage || '')
  }, [product?.mainImage])

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

  const statusClasses = productStatusClasses
  const showBoardCareUpsell = isBoardCareEligible(product.category)
  const reserveHref = `/custom-orders?product=${encodeURIComponent(product.id)}`

  return (
    <PageShell
      eyebrow={product.category}
      title={product.name}
      intro={product.description}
    >
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <PhotoFrame
            src={activeImage}
            alt={product.name}
            className="h-[26rem]"
            overlay="none"
            priority
            showLabels={false}
            imageFit="contain"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.galleryImages.map((image, index) => (
              <button
                key={`${product.id}-${index + 1}`}
                type="button"
                onClick={() => setActiveImage(image)}
                className={[
                  'overflow-hidden rounded-[1.2rem] border transition',
                  activeImage === image
                    ? 'border-amber-100/70'
                    : 'border-white/10 hover:border-amber-200/45',
                ].join(' ')}
              >
                <PhotoFrame
                  src={image}
                  alt={`${product.name} photo ${index + 1}`}
                  className="h-32 rounded-none border-0"
                  overlay="none"
                  showLabels={false}
                  imageFit="contain"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-amber-200/35 bg-stone-900 px-3 py-1.5 text-sm text-amber-50">
                {product.category}
              </span>
              <span
                className={[
                  'rounded-full border px-3 py-1.5 text-sm',
                  statusClasses[product.status],
                ].join(' ')}
              >
                {product.status}
              </span>
              {product.freeShipping ? (
                <span className="rounded-full border border-emerald-300/25 bg-emerald-950/40 px-3 py-1.5 text-sm text-emerald-100">
                  Free shipping
                </span>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ProductMeta label="Price" value={product.price} />
              <ProductMeta label="Dimensions" value={product.dimensions} />
              <ProductMeta label="Wood Type" value={product.woodType} />
              <ProductMeta label="Materials" value={product.materials || 'Selected materials'} />
              <ProductMeta label="Photos" value={`${product.galleryImages.length} image${product.galleryImages.length === 1 ? '' : 's'}`} />
            </div>
            <p className="mt-6 leading-8 text-stone-300">{product.description}</p>
            {showBoardCareUpsell ? (
              <BoardCareUpsell productId={product.id} />
            ) : (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink to={reserveHref}>{product.requestCtaText}</PrimaryLink>
                <SecondaryLink to="/available-pieces">Back to collection</SecondaryLink>
              </div>
            )}
            {showBoardCareUpsell ? (
              <div className="mt-4">
                <SecondaryLink to="/available-pieces">Back to collection</SecondaryLink>
              </div>
            ) : null}
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
  return (
    <PageShell
      eyebrow="Gallery"
      title="A visual gallery of finished work and workshop atmosphere."
      intro="Large placeholders are ready for future product and process photography while keeping the layout premium and image-led from day one."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {galleryItems.map((item, index) => (
          <Card key={item.title} className={index % 3 === 0 ? 'xl:col-span-2' : ''}>
            <PhotoFrame
              src={item.image}
              alt={item.title}
              label={item.title}
              className="mb-5 h-64"
            />
            <h2 className="font-serif text-2xl text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              Placeholder for premium photography of product details, joinery,
              surface finish, and workshop setting.
            </p>
          </Card>
        ))}
      </div>
    </PageShell>
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
      eyebrow="Custom Orders"
      title="Commission a piece built around your space, use, and material preferences."
      intro="Custom work can start from a board, tray, butcher block, engraved gift, or a fully bespoke hardwood concept."
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
            Built Around Your Request
          </p>
          <h2 className="mt-4 font-serif text-3xl text-white">How custom orders work</h2>
          <p className="mt-4 leading-8 text-stone-300">
            Share the product type, wood direction, size, and whether you want
            engraving or logo work. Every order is reviewed personally before a
            quote is confirmed.
          </p>
          <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-stone-300">
            Custom sizes, wood combinations, logo engraving, and special pieces
            are available on request.
          </div>
          <div className="mt-6 space-y-4">
            {customOrderSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <span className="mt-1 text-xs uppercase tracking-[0.3em] text-amber-200/80">
                  0{index + 1}
                </span>
                <p className="text-stone-200">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[1.6rem] border border-amber-300/20 bg-amber-200/8 p-5 text-sm leading-7 text-amber-50">
            No checkout or cart yet. The current flow is enquiry-based so each
            custom order can be quoted and confirmed directly.
          </div>
        </Card>
        <OrderForm
          title="Request a custom quote"
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
        <Card>
          <PhotoFrame
            src={aboutImagePath}
            alt="Dom's Concepts workshop in Prague"
            className="aspect-[5/4] w-full"
            overlay="none"
            showLabels={false}
            placeholderMessage="Workshop photo coming soon"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Stat value="2016" label="Handmade brand active since" />
            <Stat value="Prague, Czechia" label="Workshop location" />
            <Stat value="5-star Etsy shop" label="Trusted by Etsy customers" />
            <Stat value="Since 2019" label="On Etsy" />
          </div>
        </Card>
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

  const shellClassName = compact
    ? 'mb-3 flex min-h-[4.5rem] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c1511] via-stone-950 to-stone-900 p-3'
    : 'mb-6 flex min-h-[7rem] items-center justify-center rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-[#1c1511] via-stone-950 to-stone-900 p-4 sm:min-h-[8rem] sm:p-6'

  if (hasError) {
    return (
      <div className={shellClassName}>
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
    <div className={shellClassName}>
      <img
        src={partner.logo}
        alt={`${partner.name} logo`}
        loading="lazy"
        onError={() => setHasError(true)}
        className={[
          'w-full object-contain object-center',
          compact ? 'max-h-12 max-w-[85%]' : 'max-h-16 max-w-[88%] sm:max-h-20',
        ].join(' ')}
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
        className="group flex min-h-[8.5rem] flex-col rounded-2xl border border-amber-200/20 bg-stone-900/90 px-4 py-4 text-center transition hover:border-amber-200/45 hover:bg-stone-800"
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

function WorkshopVideoCard({ video }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [video.thumbnail])

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#1c1511] via-stone-950 to-black">
        {!hasError ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full items-end p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
              Thumbnail coming soon
            </p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm">
            ▶
          </span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-serif text-2xl text-white">{video.title}</h3>
          <p className="mt-2 text-sm leading-7 text-stone-300">{video.description}</p>
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className={goldButtonClassNameCompact}
        >
          Watch on YouTube
        </a>
      </div>
    </Card>
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

function BoardCareProductsGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {boardCareProducts.map((item) => (
        <BoardCareProductCard key={item.id} product={item} />
      ))}
    </div>
  )
}

function BoardCareProductCard({ product }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <PhotoFrame
        src={product.image}
        alt={product.title}
        className="aspect-[4/3] w-full rounded-b-none border-0"
        overlay="none"
        showLabels={false}
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="font-serif text-2xl text-white">{product.title}</h3>
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
        <p className="text-sm leading-7 text-stone-300">{product.description}</p>
        <div className="mt-auto pt-2">
          <PrimaryLink to={`/custom-orders?addon=${product.addonParam}`}>
            {product.ctaLabel}
          </PrimaryLink>
        </div>
      </div>
    </Card>
  )
}

function BoardCareUpsell({ productId }) {
  const baseHref = `/custom-orders?product=${encodeURIComponent(productId)}`

  return (
    <div className="mt-8 rounded-[1.4rem] border border-amber-200/20 bg-gradient-to-br from-[#1c1511] via-stone-950 to-black p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
        Workshop recommendation
      </p>
      <h2 className="mt-3 font-serif text-2xl text-white">Add board care and save 30%</h2>
      <p className="mt-3 text-sm leading-7 text-stone-300">
        Keep your board protected from day one. Add Dom&apos;s Concepts wood butter or
        wood wax to any board order and save 30%.
      </p>
      <ul className="mt-5 space-y-2 text-sm text-stone-300">
        {boardCareProductAddonOptions
          .filter((option) => option.value !== 'none')
          .map((option) => (
            <li
              key={option.value}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            >
              {option.label}
            </li>
          ))}
        <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          No care add-on
        </li>
      </ul>
      <div className="mt-6 flex flex-col gap-3">
        <PrimaryLink to={`${baseHref}&addon=wood-butter`}>
          Reserve with Wood Butter
        </PrimaryLink>
        <PrimaryLink to={`${baseHref}&addon=wood-wax`}>Reserve with Wood Wax</PrimaryLink>
        <SecondaryLink to={baseHref}>Reserve without add-on</SecondaryLink>
      </div>
      <p className="mt-4 text-xs leading-6 text-stone-500">
        Selected add-on will be included in your reservation enquiry. No checkout on the
        website yet.
      </p>
    </div>
  )
}

function ProductCardImage({ src, alt }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (hasError) {
    return (
      <div className="flex h-full w-full items-end bg-gradient-to-br from-[#1c1511] via-stone-950 to-black p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
          Photo coming soon
        </p>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
    />
  )
}

function ProductCard({ piece }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-white/10 bg-stone-900/55 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.9)] transition hover:border-amber-200/30 hover:bg-stone-900">
      <Link
        to={`/available-pieces/${piece.id}`}
        className="block overflow-hidden"
        aria-label={`View ${piece.name}`}
        title={piece.name}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1c1511] via-stone-950 to-black">
          <ProductCardImage src={piece.mainImage} alt={piece.name} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <Link
            to={`/available-pieces/${piece.id}`}
            className="line-clamp-2 font-serif text-lg leading-snug text-white transition hover:text-amber-200"
            title={piece.name}
          >
            {piece.name}
          </Link>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
            {piece.category}
          </p>
        </div>

        <p className="text-base font-semibold text-amber-100">{piece.price}</p>

        <div className="flex flex-wrap gap-1.5">
          <span
            className={[
              'inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]',
              productStatusClasses[piece.status],
            ].join(' ')}
          >
            {piece.status}
          </span>
          {piece.freeShipping ? (
            <span className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-950/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100">
              Free shipping
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-1">
          <Link
            to={`/available-pieces/${piece.id}`}
            className={goldButtonClassNameCompact}
          >
            View piece
          </Link>
        </div>
      </div>
    </article>
  )
}

function OrderForm({ title, presetProduct = '', presetCareAddon = 'none', defaultMessage = '' }) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    product: presetProduct,
    woodPreference: woodPreferences[0],
    size: '',
    engraving: engravingOptions[1],
    shipping: shippingOptions[0],
    budget: budgetRanges[1],
    boardCareAddon: presetCareAddon,
    message: defaultMessage,
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
      `Product / request type: ${formState.product || 'Not specified'}`,
      `Board care add-on: ${careLabel}${carePriceNote}`,
      `Wood preference: ${formState.woodPreference}`,
      `Size: ${formState.size || 'Not specified'}`,
      `Logo / engraving: ${formState.engraving}`,
      `Pickup or shipping: ${formState.shipping}`,
      `Budget range: ${formState.budget}`,
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
      <h2 className="font-serif text-3xl text-white">{title}</h2>
      <p className="mt-4 leading-8 text-stone-300">
        This form currently opens your email client to send the request to{' '}
        {contactEmail}. It can later be connected to Formspree, Basin,
        Cloudflare Forms, or an email API.
      </p>

      {presetProduct ? (
        <div className="mt-6 rounded-[1.4rem] border border-amber-200/25 bg-amber-200/8 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-100">
            Selected Product
          </p>
          <p className="mt-2 text-lg text-white">{presetProduct}</p>
        </div>
      ) : null}

      {presetCareAddon !== 'none' ? (
        <div className="mt-4 rounded-[1.4rem] border border-emerald-300/20 bg-emerald-950/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-100">
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
        <FormField
          label="Phone optional"
          name="phone"
          value={formState.phone}
          onChange={updateField}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Product type"
            name="product"
            value={formState.product}
            onChange={updateField}
            required
          />
          <SelectField
            label="Wood preference"
            name="woodPreference"
            value={formState.woodPreference}
            onChange={updateField}
            options={woodPreferences}
          />
        </div>
        <SelectField
          label="Board care add-on"
          name="boardCareAddon"
          value={formState.boardCareAddon}
          onChange={updateField}
          options={boardCareAddonOptions.map((option) => option.label)}
          optionValues={boardCareAddonOptions.map((option) => option.value)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Size" name="size" value={formState.size} onChange={updateField} />
          <SelectField
            label="Logo/engraving yes/no"
            name="engraving"
            value={formState.engraving}
            onChange={updateField}
            options={engravingOptions}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Pickup or shipping"
            name="shipping"
            value={formState.shipping}
            onChange={updateField}
            options={shippingOptions}
          />
          <SelectField
            label="Budget range"
            name="budget"
            value={formState.budget}
            onChange={updateField}
            options={budgetRanges}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-stone-200" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formState.message}
            onChange={updateField}
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-300/50"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className={goldButtonClassName}
          >
            Submit
          </button>
        </div>
      </form>
    </Card>
  )
}

function FormField({ label, name, type = 'text', value, onChange, required = false }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm text-stone-200" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-300/50"
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
      <label className="text-sm text-stone-200" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-300/50"
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
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{label}</p>
      <p className="mt-2 text-stone-200">{value}</p>
    </div>
  )
}

function SectionHeading({ eyebrow, title, intro, compact = false }) {
  return (
    <div className={compact ? 'max-w-2xl space-y-4' : 'mb-10 max-w-3xl space-y-4'}>
      <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">{eyebrow}</p>
      <h2 className="font-serif text-3xl text-white sm:text-4xl">{title}</h2>
      <p className="leading-8 text-stone-300">{intro}</p>
    </div>
  )
}

function Card({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/[0.05]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
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
      {!hasError ? (
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
      {hasError ? (
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

function SecondaryLink({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-stone-900 px-6 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-200 hover:bg-stone-800',
        className,
      ].join(' ')}
    >
      {children}
    </Link>
  )
}

export default App
