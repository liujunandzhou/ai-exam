import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import ProfileMenu from '../components/ProfileMenu';

export default function About() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Fetching spec.md...');
        fetch('/spec.md')
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`Failed to load document: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(text => {
                console.log('Content loaded, length:', text.length);
                if (text.trim().startsWith('<!DOCTYPE html>')) {
                    throw new Error('Received HTML instead of Markdown. File might be missing or path is wrong.');
                }
                setContent(text);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading spec.md:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Page Header */}
            <div className="page-header">
                <div style={{
                    maxWidth: '1200px',
                    width: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <h1 style={{ marginBottom: '0.25rem', fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: '700', letterSpacing: '-0.025em' }}>About</h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'clamp(0.875rem, 2.5vw, 0.95rem)' }}>
                            System Specification & Documentation
                        </p>
                    </div>
                    <ProfileMenu />
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '4rem' }}>
                <div className="card" style={{ overflow: 'hidden', minHeight: '200px' }}>
                    <div className="markdown-body" style={{ padding: '2rem' }}>
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                Loading documentation...
                            </div>
                        )}

                        {error && (
                            <div style={{
                                padding: '1rem',
                                background: '#fee2e2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#b91c1c'
                            }}>
                                <h3>Error Loading Document</h3>
                                <p>{error}</p>
                                <p>Please check if <code>spec.md</code> exists in the public folder.</p>
                            </div>
                        )}

                        {!loading && !error && (
                            <Markdown>{content}</Markdown>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
