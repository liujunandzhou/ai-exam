import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import ProfileMenu from '../components/ProfileMenu';

export default function About() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/spec.md')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load document');
                return response.text();
            })
            .then(text => {
                setContent(text);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <div className="page-header">
                <div style={{
                    maxWidth: '1000px',
                    width: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 1.5rem'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>About</h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>System Specification</p>
                    </div>
                    <ProfileMenu />
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
                <div className="card" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div className="markdown-body" style={{ padding: '2.5rem' }}>
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                Loading...
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
                                Error: {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <Markdown components={{
                                h1: ({ node, ...props }) => <h1 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5em', marginBottom: '1em', fontSize: '2em' }} {...props} />,
                                h2: ({ node, ...props }) => <h2 style={{ marginTop: '1.5em', marginBottom: '0.75em', fontSize: '1.5em', color: '#334155' }} {...props} />,
                                p: ({ node, ...props }) => <p style={{ lineHeight: '1.7', color: '#475569', marginBottom: '1em' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ lineHeight: '1.7', color: '#475569', marginBottom: '0.25em' }} {...props} />,
                                table: ({ node, ...props }) => <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }} {...props} /></div>,
                                th: ({ node, ...props }) => <th style={{ background: '#f1f5f9', padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'left' }} {...props} />,
                                td: ({ node, ...props }) => <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }} {...props} />,
                            }}>
                                {content}
                            </Markdown>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
