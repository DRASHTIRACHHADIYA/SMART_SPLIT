import { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Toast - Non-intrusive notification toasts
 */
function Toast() {
    const { toasts, dismissToast } = useNotifications();

    const getToastStyle = (type) => {
        const baseStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: 500,
            animation: 'slideIn 0.3s ease-out'
        };

        switch (type) {
            case 'success':
                return {
                    ...baseStyle,
                    background: 'var(--success)',
                    color: 'white'
                };
            case 'error':
                return {
                    ...baseStyle,
                    background: 'var(--danger)',
                    color: 'white'
                };
            case 'warning':
                return {
                    ...baseStyle,
                    background: 'var(--warning)',
                    color: 'white'
                };
            default: // info
                return {
                    ...baseStyle,
                    background: 'var(--primary)',
                    color: 'white'
                };
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {toasts.map(toast => (
                <div key={toast.id} style={getToastStyle(toast.type)}>
                    <span style={{ fontSize: '18px' }}>{getIcon(toast.type)}</span>
                    <span style={{ flex: 1 }}>{toast.message}</span>
                    <button
                        onClick={() => dismissToast(toast.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '0 4px',
                            opacity: 0.8
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}

            <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}

export default Toast;
