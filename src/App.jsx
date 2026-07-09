import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  useLocation,
  useSearchParams,
  Route,
  Routes,
} from 'react-router-dom'
import {
  availablePieces,
  careGuidePoints,
  customOrderSteps,
  featuredCategories,
  galleryItems,
  navItems,
  partnerItems,
  shippingOptions,
} from './siteData'

const contactEmail = 'hello@domsconcepts.com'

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/8 text-sm font-semibold tracking-[0.28em] text-amber-100">
              DC
            </div>
            <div>
              <p className="font-serif text-lg tracking-wide text-white">
                Dom&apos;s Concepts
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                Handmade in Prague
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-300/50 hover:text-white lg:hidden"
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
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="custom-orders" element={<CustomOrdersPage />} />
          <Route path="care-guide" element={<CareGuidePage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Routes>
      </main>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-3">
            <p className="font-serif text-2xl text-white">Dom&apos;s Concepts</p>
            <p className="max-w-2xl text-sm leading-7 text-stone-300">
              Premium handmade woodworking from a small Prague workshop. Built
              for kitchens, tables, gifting, and custom projects that deserve
              real materials and careful finish work.
            </p>
          </div>
          <div className="space-y-3 text-sm text-stone-300">
            <p className="text-white">Contact</p>
            <a className="inline-block transition hover:text-amber-200" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            <div className="flex flex-wrap gap-4 pt-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="transition hover:text-amber-200">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
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
          mobile ? 'border border-white/10 bg-white/5' : '',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  )
}

function PageShell({ eyebrow, title, intro, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-12 max-w-3xl space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          {eyebrow}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="text-lg leading-8 text-stone-300">{intro}</p>
      </div>
      {children}
    </section>
  )
}

function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_36%),linear-gradient(180deg,_rgba(28,25,23,0.7),_rgba(12,10,9,0.96))]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-18 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              Premium Handmade Woodworking Since 2016
            </p>
            <div className="space-y-6">
              <h1 className="max-w-3xl font-serif text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
                Handmade wooden pieces built with care in Prague.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-300">
                Cutting boards, butcher blocks, trays, coasters, and custom
                pieces made from premium hardwoods.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <PrimaryLink to="/custom-orders">Request Custom Order</PrimaryLink>
              <SecondaryLink to="/available-pieces">View Available Pieces</SecondaryLink>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-100/10 via-stone-900 to-black p-5 shadow-2xl shadow-black/30">
            <div className="h-full rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-amber-200/10 via-amber-900/25 to-stone-950 p-6">
              <div className="grid h-full min-h-[360px] gap-4 sm:grid-cols-2">
                <ImagePlaceholder label="End grain craftsmanship" className="sm:col-span-2" />
                <ImagePlaceholder label="Walnut and oak" />
                <ImagePlaceholder label="Signature finish" />
              </div>
            </div>
          </div>
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
            <Card key={category}>
              <div className="mb-5 h-40 rounded-[1.4rem] bg-gradient-to-br from-amber-100/10 via-stone-800 to-black" />
              <h3 className="font-serif text-2xl text-white">{category}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Crafted with premium hardwoods and finished for daily use,
                gifting, or custom kitchen projects.
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

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Available Pieces"
            title="Ready pieces available for reservation."
            intro="Selected finished work from the current collection, with placeholders for photography and pricing until live inventory is connected."
            compact
          />
          <SecondaryLink to="/available-pieces">Browse all available pieces</SecondaryLink>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {availablePieces.map((piece) => (
            <ProductCard key={piece.name} piece={piece} />
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
                Trusted materials, tools, and workshop collaborators.
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm text-stone-200 sm:grid-cols-4">
                {partnerItems.map((partner) => (
                  <div
                    key={partner}
                    className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-center transition hover:border-amber-300/40 hover:bg-white/5"
                  >
                    {partner}
                  </div>
                ))}
              </div>
              <SecondaryLink to="/partners">View all partners</SecondaryLink>
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

function AvailablePiecesPage() {
  return (
    <PageShell
      eyebrow="Available Pieces"
      title="Current handmade pieces ready to reserve."
      intro="This static product page is designed for direct enquiries and reservations, without checkout or cart flow."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        {availablePieces.map((piece) => (
          <ProductCard key={piece.name} piece={piece} detailed />
        ))}
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
          <Card key={item} className={index % 3 === 0 ? 'xl:col-span-2' : ''}>
            <div className="mb-5 h-64 rounded-[1.6rem] bg-gradient-to-br from-amber-100/10 via-stone-800 to-black" />
            <h2 className="font-serif text-2xl text-white">{item}</h2>
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
  const selectedPiece = searchParams.get('product') || ''

  return (
    <PageShell
      eyebrow="Custom Orders"
      title="Commission a piece built around your space, use, and material preferences."
      intro="Custom work can start from a board, tray, butcher block, engraved gift, or a fully bespoke hardwood concept."
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="font-serif text-3xl text-white">How custom orders work</h2>
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
        </Card>
        <OrderForm
          title="Request a custom quote"
          presetProduct={selectedPiece}
          defaultMessage={
            selectedPiece
              ? `I would like to reserve or ask about "${selectedPiece}".`
              : ''
          }
        />
      </div>
    </PageShell>
  )
}

function CareGuidePage() {
  return (
    <PageShell
      eyebrow="Care Guide"
      title="Simple care that keeps solid wood performing beautifully."
      intro="Every piece is made to be used, but hardwood lasts best when it is cleaned, dried, and nourished properly."
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="font-serif text-3xl text-white">Everyday care</h2>
          <div className="mt-6 space-y-4">
            {careGuidePoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-white/10 bg-black/20 p-5 text-stone-200"
              >
                {point}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-serif text-3xl text-white">Dom&apos;s Concepts wood butter</h2>
          <p className="mt-5 leading-8 text-stone-300">
            For routine maintenance, refresh the finish with Dom&apos;s Concepts
            wood butter. A light application helps protect the surface,
            deepens the tone, and keeps boards and trays conditioned between
            uses.
          </p>
          <div className="mt-8 h-72 rounded-[1.8rem] bg-gradient-to-br from-amber-100/10 via-stone-800 to-black" />
          <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-200/8 p-5 text-sm leading-7 text-amber-50">
            Avoid dishwashers, prolonged soaking, and direct heat exposure.
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

function PartnersPage() {
  return (
    <PageShell
      eyebrow="Workshop Partners"
      title="Partners and suppliers that support the workshop."
      intro="A curated set of trusted brands and collaborators connected to the materials, finish systems, and workshop environment behind Dom&apos;s Concepts."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {partnerItems.map((partner) => (
          <Card key={partner}>
            <div className="mb-6 h-36 rounded-[1.4rem] bg-gradient-to-br from-white/6 via-stone-800 to-black" />
            <h2 className="font-serif text-2xl text-white">{partner}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              Placeholder partner profile ready for future logo, materials, or
              workshop relationship details.
            </p>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A Prague woodworking brand centered on material, function, and finish."
      intro="Founded in 2016, Dom&apos;s Concepts makes premium handmade kitchen and serving pieces with a small-batch workshop approach."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="space-y-5 leading-8 text-stone-300">
            <p>
              The studio focuses on cutting boards, butcher blocks, trays,
              coasters, wood care products, and custom hardwood builds. Each
              design is intended to feel refined without losing the character
              of handmade work.
            </p>
            <p>
              Dom&apos;s Concepts values durable materials, premium finishing,
              balanced proportions, and practical use. Whether a piece is made
              for a personal kitchen, gifting, or a hospitality setting, the
              goal stays the same: warm craftsmanship you can trust.
            </p>
          </div>
        </Card>
        <Card>
          <div className="h-80 rounded-[1.8rem] bg-gradient-to-br from-amber-100/10 via-stone-800 to-black" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Stat value="2016" label="Founded in Prague" />
            <Stat value="Small-batch" label="Workshop approach" />
            <Stat value="Premium hardwoods" label="Core material focus" />
            <Stat value="Custom ready" label="Engraving and bespoke pieces" />
          </div>
        </Card>
      </div>
    </PageShell>
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
              Based in Prague. Pickup and shipping options can be discussed per
              order request.
            </p>
          </div>
        </Card>
        <OrderForm title="Send an enquiry" />
      </div>
    </PageShell>
  )
}

function ProductCard({ piece, detailed = false }) {
  const isSold = piece.status === 'Sold'

  return (
    <Card className="overflow-hidden p-0">
      <div className={`h-64 bg-gradient-to-br ${piece.tone}`} />
      <div className="space-y-5 p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-white">{piece.name}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.25em] text-stone-400">
              {piece.status}
            </p>
          </div>
          <span className="rounded-full border border-amber-300/25 bg-amber-200/8 px-4 py-2 text-sm text-amber-100">
            {piece.price}
          </span>
        </div>

        <div className="grid gap-4 text-sm text-stone-300 sm:grid-cols-3">
          <ProductMeta label="Dimensions" value={piece.dimensions} />
          <ProductMeta label="Wood Type" value={piece.wood} />
          <ProductMeta label="Status" value={piece.status} />
        </div>

        {detailed ? (
          <p className="leading-8 text-stone-300">
            Placeholder layout for detailed product photography, grain notes,
            finish details, and any future shipping or pickup information.
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-stone-400">
            Static reservation flow for now. Checkout and cart are intentionally
            not included.
          </p>
          <PrimaryLink
            to={`/custom-orders?product=${encodeURIComponent(piece.name)}`}
            className={isSold ? 'pointer-events-none opacity-50' : ''}
          >
            Reserve This Piece
          </PrimaryLink>
        </div>
      </div>
    </Card>
  )
}

function OrderForm({ title, presetProduct = '', defaultMessage = '' }) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    product: presetProduct,
    shipping: shippingOptions[0],
    message: defaultMessage,
  })

  useEffect(() => {
    setFormState((current) => ({
      ...current,
      product: presetProduct || current.product,
      message: defaultMessage || current.message,
    }))
  }, [defaultMessage, presetProduct])

  const mailtoHref = useMemo(() => {
    const subject = formState.product
      ? `Dom's Concepts enquiry: ${formState.product}`
      : "Dom's Concepts enquiry"

    const body = [
      `Name: ${formState.name}`,
      `Email: ${formState.email}`,
      `Phone: ${formState.phone || 'Not provided'}`,
      `Product / request type: ${formState.product || 'Not specified'}`,
      `Pickup or shipping: ${formState.shipping}`,
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

      <form className="mt-8 grid gap-5" action={mailtoHref}>
        <FormField label="Name" name="name" value={formState.name} onChange={updateField} required />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formState.email}
          onChange={updateField}
          required
        />
        <FormField
          label="Phone optional"
          name="phone"
          value={formState.phone}
          onChange={updateField}
        />
        <FormField
          label="Product / request type"
          name="product"
          value={formState.product}
          onChange={updateField}
          required
        />
        <div className="grid gap-2">
          <label className="text-sm text-stone-200" htmlFor="shipping">
            Pickup or shipping
          </label>
          <select
            id="shipping"
            name="shipping"
            value={formState.shipping}
            onChange={updateField}
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-300/50"
          >
            {shippingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
            className="inline-flex rounded-full bg-amber-200 px-6 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100"
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

function ImagePlaceholder({ label, className = '' }) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-amber-100/10 via-stone-800 to-black p-5',
        className,
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_35%)]" />
      <div className="relative flex h-full min-h-32 items-end">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-200">{label}</p>
      </div>
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
      className={[
        'inline-flex items-center justify-center rounded-full bg-amber-200 px-6 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100',
        className,
      ].join(' ')}
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
        'inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-stone-100 transition hover:border-amber-300/40 hover:bg-white/10',
        className,
      ].join(' ')}
    >
      {children}
    </Link>
  )
}

export default App
