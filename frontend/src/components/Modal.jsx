import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, actions, type = 'info' }) {
    if (!isOpen) return null;

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    const getHeaderColor = () => {
        switch (type) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            default: return 'text-gray-800';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>
            <div className="card" style={{
                maxWidth: '500px',
                width: '90%',
                textAlign: 'center',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'scaleIn 0.2s ease-out',
                position: 'relative'
            }} onClick={(e) => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#999'
                    }}
                >
                    &times;
                </button>

                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {getIcon()}
                </div>

                {title && (
                    <h2 style={{
                        marginBottom: '1rem',
                        fontSize: '1.5rem',
                        fontWeight: '600'
                    }} className={getHeaderColor()}>
                        {title}
                    </h2>
                )}

                <div style={{ marginBottom: '2rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                    {children}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {actions ? actions : (
                        <button
                            className="btn btn-primary"
                            onClick={onClose}
                            style={{ minWidth: '120px' }}
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
