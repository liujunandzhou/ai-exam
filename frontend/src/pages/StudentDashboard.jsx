import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function StudentDashboard() {
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchExams();
            fetchResults();
        }
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const fetchExams = async () => {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching exams:', error);
        else setExams(data);
    };

    const fetchResults = async () => {
        const { data, error } = await supabase
            .from('exam_results')
            .select('*, exams(title)')
            .eq('student_id', user.id)
            .order('submitted_at', { ascending: false });

        if (error) console.error('Error fetching results:', error);
        else setResults(data);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Page Header */}
            <div className="page-header">
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.25rem', fontSize: '1.875rem', fontWeight: '700', letterSpacing: '-0.025em' }}>Student Dashboard</h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Welcome back, {user?.email?.split('@')[0]}! Here are your exams.
                        </p>
                    </div>
                    <button
                        className="btn btn-outline"
                        onClick={handleLogout}
                        style={{
                            borderColor: 'var(--danger)',
                            color: 'var(--danger)',
                            padding: '0.5rem 1.25rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '4rem' }}>
                <div className="grid grid-cols-2" style={{ gap: '2rem', alignItems: 'start' }}>
                    {/* Available Exams Section */}
                    <div className="card" style={{ border: 'none', boxShadow: 'var(--shadow-sm)', background: 'transparent', padding: 0 }}>
                        <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Available Exams</h3>
                            <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}>{exams.length} Active</span>
                        </div>

                        <div className="scrollable-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {exams.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📝</div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No exams available</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Check back later for new assignments.</p>
                                </div>
                            ) : (
                                exams.map(exam => (
                                    <div key={exam.id} className="item-card" style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}>
                                        <div className="item-card-header">
                                            <h4 className="item-card-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{exam.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                Created {new Date(exam.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="item-card-meta" style={{ display: 'flex', gap: '0.75rem' }}>
                                            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                                                ⏱️ {exam.duration_minutes} min
                                            </span>
                                            <span className="badge" style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success-light)' }}>
                                                🎯 {exam.total_score} pts
                                            </span>
                                        </div>

                                        <Link
                                            to={`/exam/${exam.id}`}
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                textAlign: 'center',
                                                justifyContent: 'center',
                                                marginTop: '0.5rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Start Exam
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* My Results Section */}
                    <div className="card" style={{ border: 'none', boxShadow: 'var(--shadow-sm)', background: 'transparent', padding: 0 }}>
                        <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Recent Results</h3>
                            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}>{results.length} Completed</span>
                        </div>

                        <div className="scrollable-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {results.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No results yet</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete an exam to see your performance.</p>
                                </div>
                            ) : (
                                results.map(res => (
                                    <div key={res.id} className="item-card" style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <h4 className="item-card-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                    {res.exams?.title || 'Unknown Exam'}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    <span>📅 {new Date(res.submitted_at).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{new Date(res.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '1.5rem',
                                                    fontWeight: '700',
                                                    color: res.score >= (res.exams?.total_score * 0.6) ? 'var(--success)' : 'var(--danger)',
                                                    lineHeight: 1
                                                }}>
                                                    {res.score}
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '0.25rem' }}>
                                                        / {res.exams?.total_score || '?'}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    Score
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/exam-detail/${res.id}`}
                                            className="btn btn-outline"
                                            style={{
                                                width: '100%',
                                                textAlign: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '500',
                                                borderColor: 'var(--primary)',
                                                color: 'var(--primary)'
                                            }}
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
