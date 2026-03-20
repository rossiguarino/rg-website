import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production you'd send this to an error tracking service
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
          <img
            src="./logos/rg-favicon.png"
            alt="RG"
            className="h-16 w-auto mb-6 opacity-20"
          />
          <h2 className="text-2xl md:text-3xl text-brand-black mb-4">
            Algo salio mal
          </h2>
          <p className="text-brand-gray max-w-md mb-8">
            Ocurrio un error inesperado. Intenta recargar la pagina o volver al inicio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display hover:bg-brand-teal-dark transition-colors"
            >
              Recargar pagina
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center gap-2 bg-white text-brand-black px-6 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display border border-gray-200 hover:border-brand-teal hover:text-brand-teal transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
