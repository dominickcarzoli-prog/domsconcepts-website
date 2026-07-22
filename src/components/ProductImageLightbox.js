import { createElement, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { resolveActiveGalleryImage } from '../data/normalizeProductGallery.js'

/**
 * Restore body/html styles that the lightbox may have touched.
 * Safe to call when nothing was changed.
 */
export function restoreLightboxDocumentStyles(previousBodyOverflow) {
  if (typeof document === 'undefined') return

  if (previousBodyOverflow != null && previousBodyOverflow !== '') {
    document.body.style.overflow = previousBodyOverflow
  } else {
    document.body.style.removeProperty('overflow')
  }

  // Defensive cleanup if a prior session left inert / aria-hidden behind.
  if (document.body.hasAttribute('inert')) {
    document.body.removeAttribute('inert')
  }
  if (document.body.getAttribute('aria-hidden') === 'true') {
    document.body.removeAttribute('aria-hidden')
  }
  if (document.documentElement.hasAttribute('inert')) {
    document.documentElement.removeAttribute('inert')
  }
}

/**
 * Product gallery lightbox — resolves image from a stable index into the
 * same normalized gallery array used by the main image and thumbnails.
 *
 * Rendered via portal to document.body so product-layout overflow/transform
 * cannot clip or zero-size the enlarged image.
 *
 * @param {{
 *   images: { id: string, url: string, rank: number, alt: string }[],
 *   activeImageIndex: number | null,
 *   onClose: () => void,
 *   onNavigate: (index: number) => void,
 * }} props
 */
export function ProductImageLightbox({ images, activeImageIndex, onClose, onNavigate }) {
  const gallery = Array.isArray(images) ? images : []
  const activeImage = resolveActiveGalleryImage(gallery, activeImageIndex)
  const [loadFailed, setLoadFailed] = useState(false)
  const hasPrevious = activeImageIndex != null && activeImageIndex > 0
  const hasNext =
    activeImageIndex != null && activeImageIndex < gallery.length - 1

  useEffect(() => {
    setLoadFailed(false)
  }, [activeImage?.url, activeImageIndex])

  useEffect(() => {
    if (activeImageIndex == null || !activeImage) {
      restoreLightboxDocumentStyles('')
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'ArrowLeft' && hasPrevious) {
        onNavigate(activeImageIndex - 1)
        return
      }
      if (event.key === 'ArrowRight' && hasNext) {
        onNavigate(activeImageIndex + 1)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      restoreLightboxDocumentStyles(previousOverflow)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeImage, activeImageIndex, hasNext, hasPrevious, onClose, onNavigate])

  // Never render a blank dark modal when the URL is missing/invalid.
  if (activeImageIndex == null || !activeImage) return null

  const imageUrl = activeImage.url

  const dialog = createElement(
    'div',
    {
      className: 'product-image-lightbox-root',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': activeImage.alt,
      onClick: onClose,
    },
    createElement(
      'div',
      {
        className: 'product-image-lightbox',
        onClick: (event) => event.stopPropagation(),
      },
      createElement(
        'div',
        { className: 'product-image-lightbox-viewport' },
        createElement(
          'button',
          {
            type: 'button',
            onClick: onClose,
            'aria-label': 'Close image preview',
            className: 'product-image-lightbox-close',
          },
          '×',
        ),
        hasPrevious
          ? createElement(
              'button',
              {
                type: 'button',
                onClick: () => onNavigate(activeImageIndex - 1),
                'aria-label': 'Previous product photo',
                className:
                  'product-image-lightbox-nav product-image-lightbox-nav--prev',
              },
              '‹',
            )
          : null,
        loadFailed
          ? createElement(
              'p',
              { className: 'product-image-lightbox-fallback' },
              'Image could not be loaded',
            )
          : createElement('img', {
              key: imageUrl,
              src: imageUrl,
              alt: activeImage.alt,
              className: 'product-image-lightbox-image',
              loading: 'eager',
              decoding: 'async',
              // Etsy CDN can reject hotlinks that send a cross-origin Referer.
              referrerPolicy: 'no-referrer',
              onError: () => setLoadFailed(true),
            }),
        hasNext
          ? createElement(
              'button',
              {
                type: 'button',
                onClick: () => onNavigate(activeImageIndex + 1),
                'aria-label': 'Next product photo',
                className:
                  'product-image-lightbox-nav product-image-lightbox-nav--next',
              },
              '›',
            )
          : null,
      ),
    ),
  )

  // Portal out of product layout overflow so the enlarged image is not clipped/blanked.
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(dialog, document.body)
  }

  return dialog
}
