import { Component, createElement } from 'react'
import { useLocation } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleProvider.jsx'
import { PublicRouteErrorFallback } from './PublicRouteErrorFallback.js'

/**
 * Safety net for public routes — keeps chrome usable when a page throws.
 * Logs in development only; never surfaces stack traces to visitors.
 */
class RouteErrorBoundaryInner extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[PublicRouteErrorBoundary]', error, info?.componentStack)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const { t, localize } = this.props
    return createElement(PublicRouteErrorFallback, {
      t,
      localize,
      onRetry: this.handleRetry,
      onReload: this.handleReload,
    })
  }
}

/**
 * Wraps public route content and resets when the location changes.
 */
export function PublicRouteErrorBoundary({ children }) {
  const location = useLocation()
  const { t, localize } = useLocale()
  const resetKey = `${location.pathname}${location.search}${location.hash}`

  return createElement(
    RouteErrorBoundaryInner,
    { t, localize, resetKey },
    children,
  )
}

export { PublicRouteErrorFallback } from './PublicRouteErrorFallback.js'
