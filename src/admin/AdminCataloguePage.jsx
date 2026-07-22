import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  bulkProducts,
  clearAdminToken,
  fetchProducts,
  getAdminToken,
  patchProduct,
  setAdminToken,
  WEBSITE_CATEGORIES,
} from './adminApi.js'

function imageHostname(url) {
  if (!url || typeof url !== 'string') return null
  if (url.startsWith('/')) return 'self'
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function isUsableAdminImageSrc(url) {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed || trimmed === '/') return false
  if (trimmed.startsWith('https://')) {
    try {
      const { hostname, pathname } = new URL(trimmed)
      if (!hostname || pathname === '/' || pathname.length < 2) return false
      return hostname === 'i.etsystatic.com' || hostname.endsWith('.etsystatic.com')
    } catch {
      return false
    }
  }
  return trimmed.startsWith('/images/')
}

function getImageCandidates(product) {
  const candidates = []
  const add = (value) => {
    if (!isUsableAdminImageSrc(value)) return
    const trimmed = String(value).trim()
    if (!candidates.includes(trimmed)) candidates.push(trimmed)
  }
  if (product.useLocalImages && Array.isArray(product.localImages)) {
    for (const url of product.localImages) add(url)
  }
  add(product.primaryImageUrl)
  if (Array.isArray(product.etsyImageUrls)) {
    for (const url of product.etsyImageUrls) add(url)
  }
  if (!product.useLocalImages && Array.isArray(product.localImages)) {
    for (const url of product.localImages) add(url)
  }
  return candidates
}

const STATUS_LABELS = {
  available: 'Available',
  'only-one-left': 'Only one left',
  sold: 'Sold',
  archived: 'Archived',
  hidden: 'Hidden',
}

function StatusPill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/15 bg-white/5 text-stone-300',
    good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    warn: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    muted: 'border-stone-600/40 bg-stone-800/40 text-stone-400',
  }
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${tones[tone] || tones.neutral}`}
    >
      {children}
    </span>
  )
}

function LoginScreen({ onLogin }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const trimmed = token.trim()
    if (!trimmed) {
      setError('Enter the admin token.')
      return
    }
    setAdminToken(trimmed)
    const res = await fetchProducts({ state: 'active', limit: 1 })
    if (res.status === 401) {
      clearAdminToken()
      setError('Invalid admin token.')
      return
    }
    if (!res.ok) {
      clearAdminToken()
      setError(res.data?.message || 'Could not reach admin API.')
      return
    }
    onLogin()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0b09] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[rgba(24,18,14,0.92)] p-8 shadow-2xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-accent)]">
          Private admin
        </p>
        <h1 className="mt-3 font-display text-3xl text-stone-100">Etsy Catalogue</h1>
        <p className="mt-3 text-sm text-stone-400">
          Enter your admin sync token. It is kept in this browser tab only and cleared when you
          close the tab.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Admin token</span>
            <input
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-stone-100 outline-none ring-amber-400/0 transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-400/20"
              placeholder="Paste admin token"
            />
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button type="submit" className="btn-gold w-full justify-center">
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}

function englishSourceForProduct(product) {
  return {
    title: (product.customTitle || product.title || '').trim(),
    description: (product.customDescription || product.description || '').trim(),
  }
}

function TranslationStatusBadge({ locale, complete }) {
  const prefix = locale === 'de' ? 'GERMAN' : 'CZECH'
  return (
    <StatusPill tone={complete ? 'good' : 'warn'}>
      {complete ? `${prefix} COMPLETE` : `${prefix} MISSING`}
    </StatusPill>
  )
}

function ProductEditor({ product, onSave, onClose, saving }) {
  const source = englishSourceForProduct(product)
  const [langTab, setLangTab] = useState('review')
  const [draft, setDraft] = useState({
    customTitle: product.customTitle || '',
    customDescription: product.customDescription || '',
    customTitleDe: product.customTitleDe || '',
    customDescriptionDe: product.customDescriptionDe || '',
    seoTitleDe: product.seoTitleDe || '',
    seoDescriptionDe: product.seoDescriptionDe || '',
    customTitleCs: product.customTitleCs || '',
    customDescriptionCs: product.customDescriptionCs || '',
    seoTitleCs: product.seoTitleCs || '',
    seoDescriptionCs: product.seoDescriptionCs || '',
    slug: product.slug || '',
    category: product.category || '',
    featured: product.featured,
    approved: product.approved,
    hidden: product.hidden,
    useLocalImages: product.useLocalImages,
  })

  const germanComplete = Boolean(
    draft.customTitleDe.trim() && draft.customDescriptionDe.trim(),
  )
  const czechComplete = Boolean(
    draft.customTitleCs.trim() && draft.customDescriptionCs.trim(),
  )

  const handleSave = () => {
    onSave(product.listingId, {
      custom_title: draft.customTitle.trim() || null,
      custom_description: draft.customDescription.trim() || null,
      custom_title_de: draft.customTitleDe.trim() || null,
      custom_description_de: draft.customDescriptionDe.trim() || null,
      seo_title_de: draft.seoTitleDe.trim() || null,
      seo_description_de: draft.seoDescriptionDe.trim() || null,
      custom_title_cs: draft.customTitleCs.trim() || null,
      custom_description_cs: draft.customDescriptionCs.trim() || null,
      seo_title_cs: draft.seoTitleCs.trim() || null,
      seo_description_cs: draft.seoDescriptionCs.trim() || null,
      slug: draft.slug.trim() || null,
      website_category: draft.category || null,
      website_featured: draft.featured,
      website_approved: draft.approved,
      website_hidden: draft.hidden,
      website_use_local_images: draft.useLocalImages,
    })
  }

  const copyEnglish = (locale) => {
    if (locale === 'de') {
      setDraft((d) => ({
        ...d,
        customTitleDe: source.title,
        customDescriptionDe: source.description,
      }))
      return
    }
    setDraft((d) => ({
      ...d,
      customTitleCs: source.title,
      customDescriptionCs: source.description,
    }))
  }

  const clearLocale = (locale) => {
    if (locale === 'de') {
      setDraft((d) => ({
        ...d,
        customTitleDe: '',
        customDescriptionDe: '',
        seoTitleDe: '',
        seoDescriptionDe: '',
      }))
      return
    }
    setDraft((d) => ({
      ...d,
      customTitleCs: '',
      customDescriptionCs: '',
      seoTitleCs: '',
      seoDescriptionCs: '',
    }))
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/25 p-4">
      <p className="rounded-lg border border-amber-200/20 bg-amber-950/20 px-3 py-2 text-xs leading-5 text-amber-100/90">
        Translations are stored on the website and are never overwritten by Etsy sync.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'review', label: 'Review' },
          { id: 'en', label: 'English' },
          { id: 'de', label: 'Deutsch' },
          { id: 'cs', label: 'Čeština' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setLangTab(tab.id)}
            className={[
              'rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition',
              langTab === tab.id
                ? 'border-amber-200/40 bg-amber-950/40 text-amber-100'
                : 'border-white/10 text-stone-400 hover:text-stone-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
        <TranslationStatusBadge locale="de" complete={germanComplete} />
        <TranslationStatusBadge locale="cs" complete={czechComplete} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-outline !px-3 !py-1.5 !text-xs"
          onClick={() => copyEnglish('de')}
        >
          Copy English → DE
        </button>
        <button
          type="button"
          className="btn-outline !px-3 !py-1.5 !text-xs"
          onClick={() => copyEnglish('cs')}
        >
          Copy English → CS
        </button>
        <button
          type="button"
          className="btn-outline !px-3 !py-1.5 !text-xs"
          onClick={() => clearLocale('de')}
        >
          Clear German
        </button>
        <button
          type="button"
          className="btn-outline !px-3 !py-1.5 !text-xs"
          onClick={() => clearLocale('cs')}
        >
          Clear Czech
        </button>
      </div>

      {langTab === 'review' ? (
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
              English source
            </p>
            <p className="text-sm font-medium text-stone-100">{source.title || '—'}</p>
            <p className="whitespace-pre-wrap text-xs leading-5 text-stone-400">
              {source.description || '—'}
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">German</p>
            <input
              value={draft.customTitleDe}
              onChange={(e) => setDraft((d) => ({ ...d, customTitleDe: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              placeholder="German title"
            />
            <textarea
              rows={8}
              value={draft.customDescriptionDe}
              onChange={(e) => setDraft((d) => ({ ...d, customDescriptionDe: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              placeholder="German description"
            />
          </div>
          <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Czech</p>
            <input
              value={draft.customTitleCs}
              onChange={(e) => setDraft((d) => ({ ...d, customTitleCs: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              placeholder="Czech title"
            />
            <textarea
              rows={8}
              value={draft.customDescriptionCs}
              onChange={(e) => setDraft((d) => ({ ...d, customDescriptionCs: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              placeholder="Czech description"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {langTab === 'en' ? (
          <>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Website title
              </span>
              <input
                value={draft.customTitle}
                onChange={(e) => setDraft((d) => ({ ...d, customTitle: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
                placeholder={product.title}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Website description
              </span>
              <textarea
                rows={3}
                value={draft.customDescription}
                onChange={(e) => setDraft((d) => ({ ...d, customDescription: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              />
            </label>
          </>
        ) : null}

        {langTab === 'de' ? (
          <>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                German website title
              </span>
              <input
                value={draft.customTitleDe}
                onChange={(e) => setDraft((d) => ({ ...d, customTitleDe: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
                placeholder={product.customTitle || product.title}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                German website description
              </span>
              <textarea
                rows={4}
                value={draft.customDescriptionDe}
                onChange={(e) => setDraft((d) => ({ ...d, customDescriptionDe: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                German SEO title
              </span>
              <input
                value={draft.seoTitleDe}
                onChange={(e) => setDraft((d) => ({ ...d, seoTitleDe: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                German SEO description
              </span>
              <textarea
                rows={2}
                value={draft.seoDescriptionDe}
                onChange={(e) => setDraft((d) => ({ ...d, seoDescriptionDe: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              />
            </label>
          </>
        ) : null}

        {langTab === 'cs' ? (
          <>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Czech website title
              </span>
              <input
                value={draft.customTitleCs}
                onChange={(e) => setDraft((d) => ({ ...d, customTitleCs: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
                placeholder={product.customTitle || product.title}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Czech website description
              </span>
              <textarea
                rows={4}
                value={draft.customDescriptionCs}
                onChange={(e) => setDraft((d) => ({ ...d, customDescriptionCs: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Czech SEO title
              </span>
              <input
                value={draft.seoTitleCs}
                onChange={(e) => setDraft((d) => ({ ...d, seoTitleCs: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Czech SEO description
              </span>
              <textarea
                rows={2}
                value={draft.seoDescriptionCs}
                onChange={(e) => setDraft((d) => ({ ...d, seoDescriptionCs: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
              />
            </label>
          </>
        ) : null}

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Slug</span>
          <input
            value={draft.slug}
            onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
            placeholder="walnut-cutting-board"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Category</span>
          <select
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100"
          >
            <option value="">— None —</option>
            {WEBSITE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-stone-300">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.approved}
            onChange={(e) => setDraft((d) => ({ ...d, approved: e.target.checked }))}
          />
          Approved
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={!draft.hidden}
            onChange={(e) => setDraft((d) => ({ ...d, hidden: !e.target.checked }))}
          />
          Visible on site
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
          />
          Featured
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.useLocalImages}
            onChange={(e) => setDraft((d) => ({ ...d, useLocalImages: e.target.checked }))}
          />
          Use local website images instead of Etsy images
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-gold" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function AdminProductImage({ product }) {
  const candidates = useMemo(() => getImageCandidates(product), [product])
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [exhausted, setExhausted] = useState(false)
  const src = candidates[candidateIndex] || null

  useEffect(() => {
    setCandidateIndex(0)
    setExhausted(false)
  }, [product.listingId, candidates.join('|')])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    console.debug('[admin-image]', {
      listingId: product.listingId,
      hasUrl: Boolean(src),
      hostname: imageHostname(src),
      candidateCount: candidates.length,
      candidateIndex,
      exhausted,
    })
  }, [product.listingId, src, candidates.length, candidateIndex, exhausted])

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((index) => index + 1)
      return
    }
    setExhausted(true)
  }

  const showImage = Boolean(src) && !exhausted

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
      {showImage ? (
        <img
          key={`${product.listingId}-${candidateIndex}-${src}`}
          src={src}
          alt=""
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleError}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1c1511] via-stone-950 to-black px-1 text-center">
          <span className="text-[9px] uppercase tracking-[0.12em] text-stone-500">
            Image unavailable
          </span>
        </div>
      )}
    </div>
  )
}

function ProductRow({
  product,
  selected,
  onSelect,
  onQuickPatch,
  onEdit,
  editing,
  onSave,
  onCloseEdit,
  saving,
}) {
  const displayTitle = product.customTitle || product.title
  const priceLabel =
    product.price != null
      ? `${product.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${product.currency || ''}`.trim()
      : '—'

  return (
    <article className="rounded-2xl border border-white/10 bg-[rgba(24,18,14,0.75)] p-4">
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(product.listingId, e.target.checked)}
            aria-label={`Select ${displayTitle}`}
          />
          <AdminProductImage product={product} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg text-stone-100">{displayTitle}</h3>
              {product.customTitle ? (
                <p className="text-xs text-stone-500">Etsy: {product.title}</p>
              ) : null}
              <p className="mt-1 text-xs text-stone-500">ID {product.listingId}</p>
            </div>
            <div className="text-right text-sm text-stone-300">
              <p>{priceLabel}</p>
              <p className="text-xs text-stone-500">Qty {product.quantity}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusPill tone={product.etsyState === 'active' ? 'good' : 'muted'}>
              Etsy {product.etsyState}
            </StatusPill>
            <StatusPill tone={product.websiteStatus === 'sold' ? 'warn' : 'neutral'}>
              {STATUS_LABELS[product.websiteStatus] || product.websiteStatus}
            </StatusPill>
            <StatusPill tone={product.approved ? 'good' : 'muted'}>
              {product.approved ? 'Approved' : 'Unapproved'}
            </StatusPill>
            <StatusPill tone={product.hidden ? 'muted' : 'good'}>
              {product.hidden ? 'Hidden' : 'Visible'}
            </StatusPill>
            {product.category ? <StatusPill>{product.category}</StatusPill> : null}
            {product.featured ? <StatusPill tone="warn">Featured</StatusPill> : null}
            <StatusPill tone={product.useLocalImages ? 'warn' : 'good'}>
              {product.useLocalImages ? 'LOCAL OVERRIDE' : 'ETSY IMAGES'}
            </StatusPill>
            <TranslationStatusBadge locale="de" complete={product.germanComplete} />
            <TranslationStatusBadge locale="cs" complete={product.czechComplete} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-gold !px-3 !py-1.5 !text-xs"
              onClick={() => onQuickPatch(product.listingId, { website_approved: true })}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn-outline !px-3 !py-1.5 !text-xs"
              onClick={() =>
                onQuickPatch(product.listingId, {
                  website_hidden: !product.hidden,
                })
              }
            >
              {product.hidden ? 'Show' : 'Hide'}
            </button>
            <button
              type="button"
              className="btn-outline !px-3 !py-1.5 !text-xs"
              onClick={() => onEdit(product.listingId)}
            >
              Edit
            </button>
            <a
              href={product.etsyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline !px-3 !py-1.5 !text-xs"
            >
              View on Etsy
            </a>
          </div>

          {editing ? (
            <ProductEditor
              product={product}
              saving={saving}
              onSave={onSave}
              onClose={onCloseEdit}
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function AdminCataloguePage() {
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()))
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [selected, setSelected] = useState(() => new Set())

  const [filters, setFilters] = useState({
    state: 'active',
    status: '',
    approved: '',
    hidden: '',
    featured: '',
    category: '',
    search: '',
  })
  const [searchInput, setSearchInput] = useState('')

  const queryParams = useMemo(() => {
    const params = { limit: 100, offset: 0 }
    if (filters.state) params.state = filters.state
    if (filters.status) params.status = filters.status
    if (filters.approved === 'true') params.approved = true
    if (filters.approved === 'false') params.approved = false
    if (filters.hidden === 'true') params.hidden = true
    if (filters.hidden === 'false') params.hidden = false
    if (filters.featured === 'true') params.featured = true
    if (filters.category) params.category = filters.category
    if (filters.search) params.search = filters.search
    return params
  }, [filters])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetchProducts(queryParams)
    if (res.status === 401) {
      clearAdminToken()
      setAuthed(false)
      setError('Session expired. Sign in again.')
      setLoading(false)
      return
    }
    if (!res.ok) {
      setError(res.data?.message || 'Failed to load products.')
      setLoading(false)
      return
    }
    setProducts(res.data.products || [])
    setTotal(res.data.total ?? 0)
    setLoading(false)
  }, [queryParams])

  useEffect(() => {
    if (authed) loadProducts()
  }, [authed, loadProducts])

  const handleLogout = () => {
    clearAdminToken()
    setAuthed(false)
    setProducts([])
    setSelected(new Set())
  }

  const handleQuickPatch = async (listingId, fields) => {
    setSavingId(listingId)
    const res = await patchProduct(listingId, fields)
    setSavingId(null)
    if (!res.ok) {
      setError(res.data?.message || 'Update failed.')
      return
    }
    await loadProducts()
  }

  const handleSave = async (listingId, fields) => {
    setSavingId(listingId)
    const res = await patchProduct(listingId, fields)
    setSavingId(null)
    if (!res.ok) {
      setError(res.data?.message || 'Save failed.')
      return
    }
    setEditingId(null)
    await loadProducts()
  }

  const handleBulk = async (action, category) => {
    const ids = [...selected]
    if (!ids.length) return
    const res = await bulkProducts(action, ids, category)
    if (!res.ok) {
      setError(res.data?.message || 'Bulk action failed.')
      return
    }
    setSelected(new Set())
    await loadProducts()
  }

  const toggleSelect = (id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const applySearch = () => {
    setFilters((f) => ({ ...f, search: searchInput.trim() }))
  }

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-[#0d0b09] text-stone-100">
      <header className="border-b border-white/10 bg-[#0a0807]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--color-accent)]">
              Dom&apos;s Concepts · Admin
            </p>
            <h1 className="font-display text-2xl text-stone-100">Etsy Catalogue Manager</h1>
            <p className="mt-1 text-sm text-stone-500">
              Review and approve listings before they appear on the public site.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-outline" onClick={loadProducts} disabled={loading}>
              Refresh
            </button>
            <button type="button" className="btn-outline" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-white/10 bg-[rgba(24,18,14,0.6)] p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Active', state: 'active' },
              { label: 'Sold out', state: 'sold_out' },
              { label: 'Inactive / edit', state: 'inactive' },
              { label: 'Draft', state: 'draft' },
              { label: 'Expired', state: 'expired' },
              { label: 'All', state: '' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className={
                  filters.state === item.state
                    ? 'chip-gold-active px-3 py-1.5 text-xs'
                    : 'rounded-full border border-white/15 px-3 py-1.5 text-xs text-stone-400 transition hover:border-amber-300/30 hover:text-stone-200'
                }
                onClick={() => setFilters((f) => ({ ...f, state: item.state }))}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={filters.approved}
              onChange={(e) => setFilters((f) => ({ ...f, approved: e.target.value }))}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="">Approval: all</option>
              <option value="true">Approved</option>
              <option value="false">Unapproved</option>
            </select>
            <select
              value={filters.hidden}
              onChange={(e) => setFilters((f) => ({ ...f, hidden: e.target.value }))}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="">Visibility: all</option>
              <option value="false">Visible</option>
              <option value="true">Hidden</option>
            </select>
            <select
              value={filters.featured}
              onChange={(e) => setFilters((f) => ({ ...f, featured: e.target.value }))}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="">Featured: all</option>
              <option value="true">Featured only</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="">Category: all</option>
              {WEBSITE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Search title or listing ID"
              className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
            <button type="button" className="btn-outline" onClick={applySearch}>
              Search
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setFilters((f) => ({ ...f, status: 'sold' }))}
            >
              Sold status
            </button>
          </div>

          <p className="mt-4 text-sm text-stone-400">
            Showing <span className="text-stone-200">{products.length}</span> of{' '}
            <span className="text-stone-200">{total}</span> matching listings
            {selected.size > 0 ? (
              <span className="text-amber-200/90"> · {selected.size} selected</span>
            ) : null}
          </p>

          {selected.size > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-gold !px-3 !py-1.5 !text-xs"
                onClick={() => handleBulk('approve')}
              >
                Approve selected
              </button>
              <button
                type="button"
                className="btn-outline !px-3 !py-1.5 !text-xs"
                onClick={() => handleBulk('hide')}
              >
                Hide selected
              </button>
              <button
                type="button"
                className="btn-outline !px-3 !py-1.5 !text-xs"
                onClick={() => handleBulk('unhide')}
              >
                Show selected
              </button>
              <button
                type="button"
                className="btn-outline !px-3 !py-1.5 !text-xs"
                onClick={() => handleBulk('removeFeatured')}
              >
                Remove featured
              </button>
            </div>
          ) : null}
        </section>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-8 text-center text-sm text-stone-500">Loading catalogue…</p>
        ) : (
          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <ProductRow
                key={product.listingId}
                product={product}
                selected={selected.has(product.listingId)}
                onSelect={toggleSelect}
                onQuickPatch={handleQuickPatch}
                onEdit={setEditingId}
                editing={editingId === product.listingId}
                onSave={handleSave}
                onCloseEdit={() => setEditingId(null)}
                saving={savingId === product.listingId}
              />
            ))}
            {products.length === 0 ? (
              <p className="text-center text-sm text-stone-500">No listings match these filters.</p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
