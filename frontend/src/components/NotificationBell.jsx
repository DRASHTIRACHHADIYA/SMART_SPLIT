import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

/**
 * NotificationBell - Header component showing notification count and dropdown
 */
function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'payment': return '💸';
            case 'reminder': return '⏰';
            case 'activity': return '📋';
            case 'member': return '👤';
            default: return '🔔';
        }
    };

    const getNotificationColor = (priority) => {
        switch (priority) {
            case 'high': return 'var(--danger)';
            case 'medium': return 'var(--warning)';
            default: return 'var(--primary)';
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'var(--danger)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        minWidth: '18px',
                        textAlign: 'center'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '380px',
                    maxHeight: '500px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    zIndex: 1000
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                        }}>
                            Notifications
                        </h3>
                        {notifications.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--primary)',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            padding: '4px 8px'
                                        }}
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={clearAll}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        padding: '4px 8px'
                                    }}
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: '14px'
                            }}>
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        background: notification.read ? 'transparent' : 'var(--bg-tertiary)',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        gap: '12px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = notification.read ? 'transparent' : 'var(--bg-tertiary)'}
                                >
                                    <div style={{ fontSize: '20px', flexShrink: 0 }}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: notification.read ? 400 : 500,
                                            color: 'var(--text-primary)',
                                            marginBottom: '4px'
                                        }}>
                                            {notification.message}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: getNotificationColor(notification.priority),
                                            flexShrink: 0,
                                            marginTop: '6px'
                                        }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
