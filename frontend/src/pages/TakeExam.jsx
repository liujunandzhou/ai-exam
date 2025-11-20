import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

import Modal from '../components/Modal';

export default function TakeExam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [resultModal, setResultModal] = useState({ isOpen: false, score: 0, total: 0 });
    const [modal, setModal] = useState({ isOpen: false, title: '', content: '', type: 'info' });
    const { user } = useAuth();

    useEffect(() => {
        fetchExam();
    }, [id]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 60000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const fetchExam = async () => {
        // Fetch exam details
        const { data: examData, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', id)
            .single();

        if (examError) {
            setModal({
                isOpen: true,
                title: 'Error',
                content: 'Error fetching exam',
                type: 'error'
            });
            return;
        }

        setExam(examData);
        setTimeLeft(examData.duration_minutes);

        if (examData.question_ids && examData.question_ids.length > 0) {
            const { data: questionsData, error: qError } = await supabase
                .from('questions')
                .select('id, content, options, score, answer')
                .in('id', examData.question_ids);

            if (qError) console.error(qError);
            else setQuestions(questionsData);
        }
    };

    const handleAnswer = (questionId, option) => {
        setAnswers({ ...answers, [questionId]: option });
    };

    const handleSubmitClick = () => {
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);

        // Auto-grading Logic (Client-side for Lite)
        let totalScore = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.answer) {
                totalScore += q.score;
            }
        });

        try {
            const { error } = await supabase
                .from('exam_results')
                .insert([{
                    student_id: user.id,
                    exam_id: id,
                    score: totalScore,
                    answers: answers
                }]);

            if (error) throw error;

            setResultModal({ isOpen: true, score: totalScore, total: exam.total_score });
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Submission Failed',
                content: 'Submission failed: ' + err.message,
                type: 'error'
            });
        }
    }


    if (!exam) return <div className="container">Loading...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '4rem' }}>
            {/* Sticky Header for Timer & Title */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--border)',
                padding: '1rem 0',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {exam.title}
                    </h1>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: timeLeft < 5 ? '#fef2f2' : 'var(--background)',
                        padding: '0.5rem 1rem',
                        borderRadius: '999px',
                        border: `1px solid ${timeLeft < 5 ? '#fecaca' : 'var(--border)'}`,
                        color: timeLeft < 5 ? '#ef4444' : 'var(--text-primary)',
                        fontWeight: '600'
                    }}>
                        <span>⏱️</span>
                        <span>{timeLeft} min left</span>
                    </div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="flex flex-col" style={{ gap: '2rem' }}>
                    {questions.map((q, idx) => (
                        <div key={q.id} className="card" style={{ padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                                    <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{idx + 1}.</span>
                                    {q.content}
                                </h3>
                                <span className="badge" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    {q.score} pts
                                </span>
                            </div>

                            <div className="flex flex-col" style={{ gap: '0.75rem' }}>
                                {q.options.map((opt, optIdx) => {
                                    const optLabel = String.fromCharCode(65 + optIdx); // A, B, C, D
                                    const isSelected = answers[q.id] === optLabel;
                                    return (
                                        <label
                                            key={optIdx}
                                            className="option-label"
                                            style={{
                                                cursor: 'pointer',
                                                padding: '1rem',
                                                borderRadius: 'var(--radius)',
                                                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                                background: isSelected ? 'var(--primary-light)' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'all 0.2s ease',
                                                fontWeight: isSelected ? '500' : '400'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = 'var(--background)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = 'white';
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                value={optLabel}
                                                checked={isSelected}
                                                onChange={() => handleAnswer(q.id, optLabel)}
                                                style={{
                                                    width: '1.2rem',
                                                    height: '1.2rem',
                                                    marginRight: '1rem',
                                                    accentColor: 'var(--primary)',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            <span style={{
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: isSelected ? 'var(--primary)' : '#f3f4f6',
                                                color: isSelected ? 'white' : '#6b7280',
                                                borderRadius: '50%',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                marginRight: '0.75rem'
                                            }}>
                                                {optLabel}
                                            </span>
                                            <span style={{ color: isSelected ? 'var(--primary-dark)' : 'var(--text-primary)' }}>{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', paddingBottom: '2rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{
                            fontSize: '1.1rem',
                            padding: '1rem 4rem',
                            borderRadius: '999px',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                        }}
                        onClick={handleSubmitClick}
                    >
                        Submit Exam
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Ready to submit?"
                type="warning"
                actions={
                    <>
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowConfirmModal(false)}
                            style={{ flex: 1, padding: '0.75rem' }}
                        >
                            Review Answers
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleConfirmSubmit}
                            style={{ flex: 1, padding: '0.75rem' }}
                        >
                            Submit Now
                        </button>
                    </>
                }
            >
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Progress</span>
                        <span className="badge badge-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                            {Object.keys(answers).length} / {questions.length} Answered
                        </span>
                    </div>

                    {Object.keys(answers).length < questions.length ? (
                        <div style={{
                            padding: '1rem',
                            background: '#fff1f2',
                            border: '1px solid #fecdd3',
                            borderRadius: 'var(--radius)',
                            color: '#e11d48',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.75rem'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Unanswered Questions</strong>
                                <span>You have skipped <strong>{questions.length - Object.keys(answers).length}</strong> questions. Are you sure you want to submit?</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            padding: '1rem',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 'var(--radius)',
                            color: '#16a34a',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>✅</span>
                            <span>All questions answered. Good luck!</span>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Result Modal */}
            <Modal
                isOpen={resultModal.isOpen}
                onClose={() => navigate('/student')}
                title="Exam Completed"
                type="success"
                actions={
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/student')}
                        style={{ width: '100%', padding: '0.75rem' }}
                    >
                        Return to Dashboard
                    </button>
                }
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your Score</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', lineHeight: 1 }}>
                        {resultModal.score}
                        <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '500' }}>/{resultModal.total}</span>
                    </div>
                </div>
            </Modal>


            {/* Generic Modal for Errors/Info */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                type={modal.type}
            >
                {modal.content}
            </Modal>
        </div >
    );
}
