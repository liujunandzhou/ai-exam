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
        <div className="container">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1>Student Dashboard</h1>
                <button
                    className="btn btn-outline"
                    onClick={handleLogout}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-2">
                <div className="card">
                    <h3>Available Exams</h3>
                    {exams.map(exam => (
                        <div key={exam.id} className="flex justify-between items-center" style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                            <div>
                                <h4>{exam.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>{exam.duration_minutes} mins | {exam.total_score} pts</p>
                            </div>
                            <Link to={`/exam/${exam.id}`} className="btn btn-primary">Take Exam</Link>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <h3>My Results</h3>
                    {results.map(res => (
                        <div key={res.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                            <h4>{res.exams?.title || 'Unknown Exam'}</h4>
                            <p>Score: <strong style={{ color: 'var(--primary)' }}>{res.score}</strong></p>
                            <p style={{ fontSize: '0.8rem', color: '#999' }}>Submitted: {new Date(res.submitted_at).toLocaleString()}</p>
                        </div>
                    ))}
                    {results.length === 0 && <p>No results yet.</p>}
                </div>
            </div>
        </div>
    );
}
