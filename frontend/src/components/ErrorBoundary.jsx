import { Component } from 'react';

/**
 * ErrorBoundary - Catches React render errors and shows fallback UI
 * Prevents blank screen crashes in components
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius-lg)',
                    margin: '20px',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '8px'
                    }}>
                        Something went wrong
                    </h2>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        marginBottom: '24px'
                    }}>
                        {this.props.fallbackMessage || "We couldn't load this section. Please try again."}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: '12px 24px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Try Again
                    </button>

                    {/* Show error details in development */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{
                            marginTop: '24px',
                            textAlign: 'left',
                            padding: '16px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            color: 'var(--text-muted)'
                        }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                                Error Details
                            </summary>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
