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
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                padding: '4rem 2rem 6rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Abstract Background Shapes */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                        <div>
                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                fontWeight: '800',
                                letterSpacing: '-0.03em',
                                lineHeight: '1.1',
                                marginBottom: '1rem',
                                background: 'linear-gradient(to right, #fff, #94a3b8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                AI Exam System
                            </h1>
                            <p style={{
                                fontSize: '1.25rem',
                                color: '#94a3b8',
                                maxWidth: '600px',
                                lineHeight: '1.6'
                            }}>
                                Enterprise-grade assessment platform built for the future of education. Secure, scalable, and intelligent.
                            </p>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <ProfileMenu />
                        </div>
                    </div>

                    {/* Feature Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                        marginTop: '2rem'
                    }}>
                        <FeatureCard
                            icon={<ShieldIcon />}
                            title="Bank-Grade Security"
                            desc="Row Level Security (RLS) and server-side grading ensure absolute data integrity."
                        />
                        <FeatureCard
                            icon={<ZapIcon />}
                            title="Lightning Fast"
                            desc="Powered by React and Supabase Edge Network for millisecond-level responses."
                        />
                        <FeatureCard
                            icon={<BrainIcon />}
                            title="Intelligent Workflow"
                            desc="Smart question management and automated grading streamline the entire process."
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container" style={{
                maxWidth: '1000px',
                margin: '-4rem auto 4rem',
                padding: '0 1.5rem',
                position: 'relative',
                zIndex: 10
            }}>
                <div className="card" style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                    border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                    <div className="markdown-body" style={{ padding: '4rem' }}>
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                                <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                                Loading system specifications...
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <Markdown components={{
                                h1: ({ node, ...props }) => <h1 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5em', marginBottom: '1.5em', marginTop: '0' }} {...props} />,
                                h2: ({ node, ...props }) => <h2 style={{ color: '#1e293b', marginTop: '2em', marginBottom: '1em' }} {...props} />,
                                p: ({ node, ...props }) => <p style={{ lineHeight: '1.8', color: '#475569', marginBottom: '1.5em' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ lineHeight: '1.8', color: '#475569', marginBottom: '0.5em' }} {...props} />,
                                table: ({ node, ...props }) => <div style={{ overflowX: 'auto', marginBottom: '2rem' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }} {...props} /></div>,
                                th: ({ node, ...props }) => <th style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#334155' }} {...props} />,
                                td: ({ node, ...props }) => <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#475569' }} {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '4px solid #6366f1', background: '#f8fafc', margin: '1.5em 0', padding: '1em 1.5em', color: '#475569', fontStyle: 'italic' }} {...props} />,
                            }}>
                                {content}
                            </Markdown>
                        )}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    &copy; {new Date().getFullYear()} AI Exam System. All rights reserved.
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            transition: 'transform 0.2s ease',
            cursor: 'default'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(99, 102, 241, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#818cf8'
            }}>
                {icon}
            </div>
            <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>{title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{desc}</p>
        </div>
    );
}

// Simple SVG Icons
const ShieldIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
);

const ZapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const BrainIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
    </svg>
);
