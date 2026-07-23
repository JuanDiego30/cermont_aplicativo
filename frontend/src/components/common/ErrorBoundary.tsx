'use client';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps { children: ReactNode; fallback?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void { console.error('[ErrorBoundary] Caught:', error, errorInfo); }
  handleRetry = (): void => { this.setState({ hasError: false, error: null }); };
  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) { return this.props.fallback; }
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-danger-bg bg-danger-bg/10 p-8 text-center">
          <AlertTriangle className="size-10 text-brand-error" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold text-ink">Error inesperado</h3>
            <p className="mt-1 text-sm text-slate">{this.state.error?.message || 'Ocurrió un error al cargar esta sección.'}</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={this.handleRetry} className="btn-primary"><RefreshCw className="size-4" /> Reintentar</button>
            <button type="button" onClick={() => window.location.href = '/'} className="btn-secondary"><Home className="size-4" /> Volver al inicio</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
