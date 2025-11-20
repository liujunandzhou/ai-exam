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
        <div className="container">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1>{exam.title}</h1>
                <div className="card" style={{ padding: '0.5rem 1rem', marginBottom: 0 }}>
                    Time Left: <strong>{timeLeft} mins</strong>
                </div>
            </div>

            <div className="flex flex-col" style={{ gap: '2rem' }}>
                {questions.map((q, idx) => (
                    <div key={q.id} className="card">
                        <h3>{idx + 1}. {q.content} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666' }}>({q.score} pts)</span></h3>
                        <div className="flex flex-col" style={{ gap: '0.5rem', marginTop: '1rem' }}>
                            {q.options.map((opt, optIdx) => {
                                const optLabel = String.fromCharCode(65 + optIdx); // A, B, C, D
                                return (
                                    <label key={optIdx} className="flex items-center" style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '0.25rem', background: answers[q.id] === optLabel ? '#e0f2fe' : 'transparent' }}>
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            value={optLabel}
                                            checked={answers[q.id] === optLabel}
                                            onChange={() => handleAnswer(q.id, optLabel)}
                                            style={{ width: 'auto', marginRight: '1rem', marginBottom: 0 }}
                                        />
                                        <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{optLabel}.</span> {opt}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }} onClick={handleSubmitClick}>
                    Submit Exam
                </button>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Ready to hand in?"
                type="warning"
                actions={
                    <>
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowConfirmModal(false)}
                            style={{ flex: 1, padding: '0.75rem' }}
                        >
                            Let me check again
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleConfirmSubmit}
                            style={{ flex: 1, padding: '0.75rem' }}
                        >
                            Yes, I'm done
                        </button>
                    </>
                }
            >
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Questions Answered</span>
                        <span className="badge badge-primary" style={{ fontSize: '1rem' }}>
                            {Object.keys(answers).length} / {questions.length}
                        </span>
                    </div>

                    {Object.keys(answers).length < questions.length ? (
                        <div style={{
                            padding: '0.75rem',
                            background: '#fff1f2',
                            border: '1px solid #fecdd3',
                            borderRadius: 'var(--radius)',
                            color: '#e11d48',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>⚠️</span>
                            <span>You have <strong>{questions.length - Object.keys(answers).length}</strong> unanswered questions.</span>
                        </div>
                    ) : (
                        <div style={{
                            padding: '0.75rem',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 'var(--radius)',
                            color: '#16a34a',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>✅</span>
                            <span>Great! You've answered all questions.</span>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Result Modal */}
            <Modal
                isOpen={resultModal.isOpen}
                onClose={() => navigate('/student')}
                title="Exam Submitted!"
                type="success"
                actions={
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/student')}
                        style={{ minWidth: '120px' }}
                    >
                        Return to Dashboard
                    </button>
                }
            >
                <div style={{ fontSize: '1.2rem' }}>
                    Your score: <strong>{resultModal.score}</strong> / {resultModal.total}
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
