import React, { useEffect, useState } from 'react';

function ErrorDisplay({ title, message, stack, extra }: { title: string; message: string; stack?: string; extra?: string | null }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0b0c0f', color: '#fff',
      padding: '24px', overflow: 'auto', fontFamily: 'monospace', fontSize: '12px',
      zIndex: 999999, lineHeight: 1.6,
    }}>
      <div style={{ color: '#d8ad45', fontWeight: 900, fontSize: '16px', marginBottom: '12px' }}>
        {title} — capture cet écran
      </div>
      <div style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
        {message}
      </div>
      {stack && (
        <div style={{ color: '#aaa', whiteSpace: 'pre-wrap', fontSize: '10px' }}>
          {stack}
        </div>
      )}
      {extra && (
        <div style={{ color: '#666', whiteSpace: 'pre-wrap', fontSize: '10px', marginTop: '16px', borderTop: '1px solid #333', paddingTop: '16px' }}>
          {extra}
        </div>
      )}
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '24px', padding: '12px 20px', background: '#d8ad45', color: '#1a1206',
          border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '12px',
          textTransform: 'uppercase',
        }}
      >
        Recharger l'app
      </button>
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null; info: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info: info.componentStack || null });
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorDisplay
          title="ERREUR D'AFFICHAGE"
          message={`${this.state.error.name}: ${this.state.error.message}`}
          stack={this.state.error.stack}
          extra={this.state.info}
        />
      );
    }
    return this.props.children;
  }
}

export function GlobalErrorOverlay() {
  const [caught, setCaught] = useState<{ message: string; stack?: string } | null>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      setCaught({
        message: event.message || 'Erreur inconnue',
        stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      setCaught({
        message: reason?.message || String(reason) || 'Promesse rejetée sans message',
        stack: reason?.stack,
      });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!caught) return null;
  return <ErrorDisplay title="ERREUR (hors affichage)" message={caught.message} stack={caught.stack} />;
}
