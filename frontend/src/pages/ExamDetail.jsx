import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function ExamDetail() {
    const { resultId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [result, setResult] = useState(null);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        if (user && resultId) {
            fetchExamDetail();
        }
    }, [user, resultId]);

    const fetchExamDetail = async () => {
        setLoading(true);
        try {
            // Fetch exam result
            const { data: resultData, error: resultError } = await supabase
                .from('exam_results')
                .select('*, exams(title, total_score)')
                .eq('id', resultId)
                .eq('student_id', user.id)
                .single();

            if (resultError) throw resultError;
            setResult(resultData);

            // Fetch exam details
            const { data: examData, error: examError } = await supabase
                .from('exams')
                .select('*')
                .eq('id', resultData.exam_id)
                .single();

            if (examError) throw examError;
            setExam(examData);

            // Fetch all questions for this exam
            const { data: questionsData, error: questionsError } = await supabase
                .from('questions')
                .select('*')
                .in('id', examData.question_ids);

            if (questionsError) throw questionsError;

            // Sort questions to match exam order
            const sortedQuestions = examData.question_ids.map(qid =>
                questionsData.find(q => q.id === qid)
            ).filter(Boolean);

            setQuestions(sortedQuestions);
        } catch (error) {
            console.error('Error fetching exam detail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading exam details...</p>
                </div>
            </div>
        );
    }

    if (!result || !exam) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <h3>Exam not found</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/student')} style={{ marginTop: '1rem' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const studentAnswers = result.answers || {};
    const correctCount = questions.filter(q => studentAnswers[q.id] === q.answer).length;
    const wrongCount = questions.length - correctCount;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '4rem' }}>
            {/* Header */}
            <div className="page-header" style={{ marginBottom: 0 }}>
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '0 2rem' }}>
                    <button
                        onClick={() => navigate('/student')}
                        className="btn btn-outline"
                        style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '700' }}>
                        {exam.title}
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Submitted on {new Date(result.submitted_at).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Summary Card */}
            <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, white 100%)', border: `2px solid var(--primary)` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Final Score
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                                {result.score}
                                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '0.25rem' }}>
                                    / {exam.total_score}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Correct
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)' }}>
                                {correctCount}
                                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '0.25rem' }}>
                                    / {questions.length}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Incorrect
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--danger)' }}>
                                {wrongCount}
                                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '0.25rem' }}>
                                    / {questions.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Review */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                    Question-by-Question Review
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {questions.map((q, idx) => {
                        const studentAnswer = studentAnswers[q.id];
                        const isCorrect = studentAnswer === q.answer;
                        const options = q.options || [];

                        return (
                            <div
                                key={q.id}
                                className="card"
                                style={{
                                    border: `2px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                                    background: isCorrect ? 'var(--success-light)' : '#fff5f5'
                                }}
                            >
                                {/* Question Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, color: 'var(--text-primary)', flex: 1 }}>
                                        <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{idx + 1}.</span>
                                        {q.content}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="badge" style={{
                                            background: isCorrect ? 'var(--success)' : 'var(--danger)',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            padding: '0.375rem 0.75rem'
                                        }}>
                                            {isCorrect ? '✓ Correct' : '✗ Wrong'}
                                        </span>
                                        <span className="badge" style={{
                                            background: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.8rem'
                                        }}>
                                            {q.score} pts
                                        </span>
                                    </div>
                                </div>

                                {/* Options */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {options.map((opt, optIdx) => {
                                        const optLabel = String.fromCharCode(65 + optIdx); // A, B, C, D
                                        const isStudentAnswer = studentAnswer === optLabel;
                                        const isCorrectAnswer = q.answer === optLabel;

                                        let borderColor = 'var(--border)';
                                        let bgColor = 'white';
                                        let icon = null;

                                        if (isCorrectAnswer) {
                                            borderColor = 'var(--success)';
                                            bgColor = 'var(--success-light)';
                                            icon = '✓';
                                        }

                                        if (isStudentAnswer && !isCorrect) {
                                            borderColor = 'var(--danger)';
                                            bgColor = '#fff5f5';
                                            icon = '✗';
                                        }

                                        return (
                                            <div
                                                key={optIdx}
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: 'var(--radius)',
                                                    border: `2px solid ${borderColor}`,
                                                    background: bgColor,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    fontWeight: (isStudentAnswer || isCorrectAnswer) ? '600' : '400'
                                                }}
                                            >
                                                <span style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: isCorrectAnswer ? 'var(--success)' : (isStudentAnswer ? 'var(--danger)' : '#f3f4f6'),
                                                    color: (isCorrectAnswer || isStudentAnswer) ? 'white' : '#6b7280',
                                                    borderRadius: '50%',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    flexShrink: 0
                                                }}>
                                                    {optLabel}
                                                </span>
                                                <span style={{ flex: 1, lineHeight: '1.5' }}>{opt}</span>
                                                {icon && (
                                                    <span style={{
                                                        fontSize: '1.25rem',
                                                        color: isCorrectAnswer ? 'var(--success)' : 'var(--danger)',
                                                        fontWeight: '700'
                                                    }}>
                                                        {icon}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation (if wrong) */}
                                {!isCorrect && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        background: 'white',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Your answer:</span>
                                            <span style={{ color: 'var(--danger)' }}>{studentAnswer || 'No answer'}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>|</span>
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Correct answer:</span>
                                            <span style={{ color: 'var(--success)' }}>{q.answer}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
