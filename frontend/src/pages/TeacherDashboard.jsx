import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import ProfileMenu from '../components/ProfileMenu';

export default function TeacherDashboard() {
    const [activeTab, setActiveTab] = useState('questions');
    const [creationMode, setCreationMode] = useState('manual'); // 'manual' or 'batch'
    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null); // For analytics view
    const [examResults, setExamResults] = useState([]);
    const [examQuestions, setExamQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({ content: '', options: ['', ''], answer: 'A', score: 1 });
    const [newExam, setNewExam] = useState({ title: '', duration_minutes: 60, total_score: 100, question_ids: [] });
    const [modal, setModal] = useState({ isOpen: false, title: '', content: '', type: 'info' });
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchQuestions();
            fetchExams();
        }
    }, [user]);



    const fetchQuestions = async () => {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching questions:', error);
        else setQuestions(data);
    };

    const fetchExams = async () => {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching exams:', error);
        else setExams(data);
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('questions')
            .insert([{ ...newQuestion, created_by: user.id }]);

        if (error) {
            setModal({ isOpen: true, title: 'Error', content: 'Error creating question: ' + error.message, type: 'error' });
        } else {
            setNewQuestion({ content: '', options: ['', ''], answer: 'A', score: 1 });
            fetchQuestions();
            setModal({ isOpen: true, title: 'Success', content: 'Question created successfully!', type: 'success' });
        }
    };

    const handleAddOption = () => {
        if (newQuestion.options.length < 5) {
            setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
        }
    };

    const handleRemoveOption = () => {
        if (newQuestion.options.length > 2) {
            const newOptions = newQuestion.options.slice(0, -1);
            setNewQuestion({
                ...newQuestion,
                options: newOptions,
                answer: newQuestion.answer > String.fromCharCode(64 + newOptions.length) ? 'A' : newQuestion.answer
            });
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('exams')
            .insert([{ ...newExam, created_by: user.id }]);

        if (error) {
            setModal({ isOpen: true, title: 'Error', content: 'Error creating exam: ' + error.message, type: 'error' });
        } else {
            setNewExam({ title: '', duration_minutes: 60, total_score: 100, question_ids: [] });
            fetchExams();
            setModal({ isOpen: true, title: 'Success', content: 'Exam created successfully!', type: 'success' });
        }
    };

    const toggleQuestionSelection = (id) => {
        const ids = newExam.question_ids.includes(id)
            ? newExam.question_ids.filter(qid => qid !== id)
            : [...newExam.question_ids, id];
        setNewExam({ ...newExam, question_ids: ids });
    };

    const fetchExamAnalytics = async (examId) => {
        // Fetch exam results
        const { data: results, error: resultsError } = await supabase
            .from('exam_results')
            .select(`
                id,
                score,
                answers,
                submitted_at,
                student_id
            `)
            .eq('exam_id', examId)
            .order('score', { ascending: false });

        if (resultsError) {
            console.error('Error fetching results:', resultsError);
            return;
        }

        // Fetch student profiles
        if (results && results.length > 0) {
            const studentIds = results.map(r => r.student_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username')
                .in('id', studentIds);

            // Merge profiles with results
            const resultsWithProfiles = results.map(result => ({
                ...result,
                studentName: profiles?.find(p => p.id === result.student_id)?.username || 'Unknown'
            }));
            setExamResults(resultsWithProfiles);
        } else {
            setExamResults([]);
        }

        // Fetch exam and its questions
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .single();

        if (examError) {
            console.error('Error fetching exam:', examError);
            return;
        }

        // Fetch questions for this exam
        if (exam && exam.question_ids && exam.question_ids.length > 0) {
            const { data: questionsData } = await supabase
                .from('questions')
                .select('*')
                .in('id', exam.question_ids);
            setExamQuestions(questionsData || []);
        }

        setSelectedExam(exam);
    };

    const calculateErrorDistribution = () => {
        if (!examQuestions.length || !examResults.length) return [];

        return examQuestions.map(question => {
            const stats = {
                question: question.content,
                correctAnswer: question.answer,
                totalAttempts: 0,
                wrongCount: 0,
                wrongAnswers: {}
            };

            examResults.forEach(result => {
                const studentAnswer = result.answers?.[question.id];
                if (studentAnswer !== undefined) {
                    stats.totalAttempts++;
                    if (studentAnswer !== question.answer) {
                        stats.wrongCount++;
                        stats.wrongAnswers[studentAnswer] = (stats.wrongAnswers[studentAnswer] || 0) + 1;
                    }
                }
            });

            stats.errorRate = stats.totalAttempts > 0 ? (stats.wrongCount / stats.totalAttempts * 100).toFixed(1) : 0;
            return stats;
        });
    };

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
                        <h1 style={{ marginBottom: '0.25rem', fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: '700', letterSpacing: '-0.025em' }}>Teacher Dashboard</h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'clamp(0.875rem, 2.5vw, 0.95rem)' }}>
                            Create and manage exams, questions, and view results.
                        </p>
                    </div>
                    <ProfileMenu />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('questions')}
                    >
                        📝 Questions
                    </button>
                    <button
                        className={`tab ${activeTab === 'exams' ? 'active' : ''}`}
                        onClick={() => setActiveTab('exams')}
                    >
                        📋 Exams
                    </button>
                </div>

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                    <div className="grid grid-cols-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
                        {/* Left Column: Creation Tools */}
                        <div>
                            <div className="section-header" style={{ marginBottom: '1rem' }}>
                                <h3>Create Question</h3>
                            </div>
                            <div className="card" style={{ position: 'sticky', top: '1rem' }}>

                                {/* Mode Switcher */}
                                <div className="mode-switcher" style={{ marginBottom: '1.25rem' }}>
                                    <button
                                        className={creationMode === 'manual' ? 'active' : ''}
                                        onClick={() => setCreationMode('manual')}
                                    >
                                        ✏️ Manual Entry
                                    </button>
                                    <button
                                        className={creationMode === 'batch' ? 'active' : ''}
                                        onClick={() => setCreationMode('batch')}
                                    >
                                        📂 Batch Import
                                    </button>
                                </div>

                                {/* Manual Entry Form */}
                                {creationMode === 'manual' && (
                                    <form onSubmit={handleCreateQuestion} className="flex flex-col">
                                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)', display: 'block' }}>
                                            Question Content
                                        </label>
                                        <textarea
                                            placeholder="Enter your question here..."
                                            value={newQuestion.content}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                                            rows={3}
                                            required
                                            style={{ marginBottom: '1rem' }}
                                        />

                                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'block' }}>
                                            Options ({newQuestion.options.length})
                                        </label>
                                        <div style={{ marginBottom: '1rem' }}>
                                            {newQuestion.options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center" style={{ marginBottom: '0.5rem', gap: '0.5rem' }}>
                                                    <div style={{
                                                        minWidth: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <input
                                                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOptions = [...newQuestion.options];
                                                            newOptions[idx] = e.target.value;
                                                            setNewQuestion({ ...newQuestion, options: newOptions });
                                                        }}
                                                        style={{ marginBottom: 0, flex: 1 }}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                            <div className="flex" style={{ marginTop: '0.75rem', gap: '0.5rem' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={handleAddOption}
                                                    disabled={newQuestion.options.length >= 5}
                                                    style={{ flex: 1, fontSize: '0.8rem' }}
                                                >
                                                    + Add Option
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={handleRemoveOption}
                                                    disabled={newQuestion.options.length <= 2}
                                                    style={{ flex: 1, fontSize: '0.8rem' }}
                                                >
                                                    - Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>
                                                    Correct Answer
                                                </label>
                                                <select
                                                    value={newQuestion.answer}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                                                >
                                                    {newQuestion.options.map((_, idx) => {
                                                        const letter = String.fromCharCode(65 + idx);
                                                        return <option key={letter} value={letter}>Option {letter}</option>;
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>
                                                    Points
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Score"
                                                    value={newQuestion.score}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, score: parseInt(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                                            Add Question
                                        </button>
                                    </form>
                                )}

                                {/* Batch Import */}
                                {creationMode === 'batch' && (
                                    <div>
                                        <div style={{
                                            border: '2px dashed var(--border)',
                                            borderRadius: 'var(--radius)',
                                            padding: '3rem 2rem',
                                            textAlign: 'center',
                                            backgroundColor: 'var(--background)',
                                            transition: 'border-color 0.2s'
                                        }}
                                            onDragOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                        >
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
                                            <h4 style={{ marginBottom: '0.5rem' }}>Upload Questions</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                                Supports <strong>CSV</strong> or <strong>JSON</strong>
                                                <br />
                                                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>CSV: content, answer, score, optA, optB, ...</span>
                                            </p>
                                            <input
                                                type="file"
                                                accept=".csv,.json"
                                                style={{
                                                    width: 'auto',
                                                    marginBottom: 0,
                                                    padding: '0.625rem 1.25rem',
                                                    background: 'white',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 'var(--radius)',
                                                    cursor: 'pointer'
                                                }}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    try {
                                                        const text = await file.text();
                                                        let questionsToInsert = [];

                                                        if (file.name.endsWith('.csv')) {
                                                            const lines = text.split('\n');
                                                            questionsToInsert = lines.slice(1).filter(line => line.trim()).map(line => {
                                                                const parts = line.split(',').map(s => s.trim());
                                                                if (parts.length < 5) return null;

                                                                const content = parts[0];
                                                                const answer = parts[1].toUpperCase();
                                                                const score = parseInt(parts[2]) || 1;
                                                                const options = parts.slice(3).filter(o => o !== '');

                                                                if (options.length < 2 || options.length > 5) return null;

                                                                return {
                                                                    content,
                                                                    options,
                                                                    answer,
                                                                    score,
                                                                    created_by: user.id
                                                                };
                                                            }).filter(q => q !== null);
                                                        } else if (file.name.endsWith('.json')) {
                                                            const json = JSON.parse(text);
                                                            if (Array.isArray(json)) {
                                                                questionsToInsert = json.map(q => {
                                                                    if (!q.options || q.options.length < 2 || q.options.length > 5) return null;
                                                                    return {
                                                                        content: q.content,
                                                                        options: q.options,
                                                                        answer: q.answer,
                                                                        score: q.score,
                                                                        created_by: user.id
                                                                    };
                                                                }).filter(q => q !== null);
                                                            }
                                                        }

                                                        if (questionsToInsert.length > 0) {
                                                            const { error } = await supabase.from('questions').insert(questionsToInsert);
                                                            if (error) throw error;
                                                            setModal({ isOpen: true, title: 'Import Successful', content: `✅ Successfully imported ${questionsToInsert.length} questions!`, type: 'success' });
                                                            fetchQuestions();
                                                        } else {
                                                            setModal({ isOpen: true, title: 'Import Failed', content: '⚠️ No valid questions found. Ensure 2-5 options per question.', type: 'warning' });
                                                        }
                                                    } catch (err) {
                                                        setModal({ isOpen: true, title: 'Import Error', content: '❌ Import failed: ' + err.message, type: 'error' });
                                                    } finally {
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Question Library */}
                        <div>
                            <div className="section-header" style={{ marginBottom: '1rem' }}>
                                <h3>Question Library</h3>
                                <span className="badge badge-primary">{questions.length} Total</span>
                            </div>
                            <div className="scrollable-list">
                                {questions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                                        <p>No questions yet. Create your first one!</p>
                                    </div>
                                ) : (
                                    questions.map((q) => (
                                        <div key={q.id} className="item-card">
                                            <div className="item-card-header">
                                                <h4 className="item-card-title">{q.content}</h4>
                                                <div className="item-card-meta">
                                                    <span className="badge badge-success">{q.score} pts</span>
                                                    <span className="badge badge-primary">Ans: {q.answer}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {q.options && q.options.map((opt, idx) => (
                                                    <div key={idx} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: 'calc(var(--radius) - 0.25rem)',
                                                        background: q.answer === String.fromCharCode(65 + idx) ? 'rgba(34, 197, 94, 0.05)' : 'var(--background)',
                                                        border: q.answer === String.fromCharCode(65 + idx) ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent',
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        <span style={{ fontWeight: 700, color: q.answer === String.fromCharCode(65 + idx) ? 'var(--success)' : 'var(--text-muted)' }}>
                                                            {String.fromCharCode(65 + idx)}
                                                        </span>
                                                        <span>{opt}</span>
                                                        {q.answer === String.fromCharCode(65 + idx) && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>✓</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Exams Tab */}
                {activeTab === 'exams' && (
                    <div className="grid grid-cols-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
                        {/* Left Column: Create Exam */}
                        <div>
                            <div className="card" style={{ position: 'sticky', top: '1rem' }}>
                                <div className="section-header" style={{ marginBottom: '1rem' }}>
                                    <h3>Create Exam</h3>
                                </div>
                                <form onSubmit={handleCreateExam} className="flex flex-col">
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)', display: 'block' }}>
                                        Exam Title
                                    </label>
                                    <input
                                        placeholder="e.g., Midterm Exam"
                                        value={newExam.title}
                                        onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                        required
                                    />
                                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>
                                                Duration (min)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={newExam.duration_minutes}
                                                onChange={(e) => setNewExam({ ...newExam, duration_minutes: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>
                                                Total Score
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={newExam.total_score}
                                                onChange={(e) => setNewExam({ ...newExam, total_score: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '0.5rem', color: 'var(--text-main)' }}>
                                        Select Questions ({newExam.question_ids.length} selected)
                                    </label>
                                    <div style={{
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        padding: '0.75rem',
                                        marginBottom: '1rem',
                                        background: 'var(--background)'
                                    }}>
                                        {questions.length === 0 ? (
                                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                No questions available. Create some first!
                                            </p>
                                        ) : (
                                            questions.map(q => (
                                                <label key={q.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    borderRadius: 'calc(var(--radius) - 0.25rem)',
                                                    marginBottom: '0.5rem',
                                                    background: newExam.question_ids.includes(q.id) ? 'rgba(79, 70, 229, 0.05)' : 'white',
                                                    border: '1px solid',
                                                    borderColor: newExam.question_ids.includes(q.id) ? 'var(--primary)' : 'var(--border)',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={newExam.question_ids.includes(q.id)}
                                                        onChange={() => toggleQuestionSelection(q.id)}
                                                        style={{ width: 'auto', marginRight: '0.75rem', marginBottom: 0 }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{q.content}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.score} points</div>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        Create Exam
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Exam Library */}
                        <div>
                            <div className="section-header" style={{ marginBottom: '1rem' }}>
                                <h3>Exam Library</h3>
                                <span className="badge badge-primary">{exams.length} Total</span>
                            </div>
                            <div className="scrollable-list">
                                {exams.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                                        <p>No exams yet. Create your first one!</p>
                                    </div>
                                ) : (
                                    exams.map(exam => (
                                        <div key={exam.id} className="item-card">
                                            <div className="item-card-header">
                                                <h4 className="item-card-title">{exam.title}</h4>
                                            </div>
                                            <div className="item-card-meta" style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
                                                <span className="badge badge-primary">⏱️ {exam.duration_minutes} min</span>
                                                <span className="badge badge-success">🎯 {exam.total_score} pts</span>
                                                <span className="badge badge-primary">📝 {exam.question_ids?.length || 0} questions</span>
                                            </div>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => {
                                                    fetchExamAnalytics(exam.id);
                                                    setActiveTab('analytics');
                                                }}
                                                style={{ width: '100%', fontSize: '0.875rem' }}
                                            >
                                                📊 View Results
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* Analytics Tab */}
                {activeTab === 'analytics' && selectedExam && (
                    <div className="container">
                        <button
                            className="btn btn-outline"
                            onClick={() => setActiveTab('exams')}
                            style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            ← Back to Exams
                        </button>

                        <div className="section-header" style={{ marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{selectedExam.title}</h2>
                                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                                    Analytics & Performance
                                </p>
                            </div>
                            <div className="card" style={{ padding: '1rem 2rem', textAlign: 'center', minWidth: '200px' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Average Score</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {examResults.length > 0
                                        ? (examResults.reduce((acc, curr) => acc + curr.score, 0) / examResults.length).toFixed(1)
                                        : '0.0'}
                                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / {selectedExam.total_score}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2" style={{ gap: '2rem', alignItems: 'start' }}>
                            {/* Left Column: Student Scores */}
                            <div>
                                <div className="section-header" style={{ marginBottom: '1rem' }}>
                                    <h3>Student Scores</h3>
                                    <span className="badge badge-primary">{examResults.length} Submissions</span>
                                </div>
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                            <tr>
                                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Student</th>
                                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Score</th>
                                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {examResults.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        No submissions yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                examResults.map(result => (
                                                    <tr key={result.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{result.studentName}</td>
                                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: result.score >= selectedExam.total_score * 0.6 ? 'var(--success)' : 'var(--danger)' }}>
                                                            {result.score}
                                                        </td>
                                                        <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                            {new Date(result.submitted_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right Column: Error Distribution */}
                            <div>
                                <div className="section-header" style={{ marginBottom: '1rem' }}>
                                    <h3>Error Distribution</h3>
                                </div>
                                <div className="flex flex-col" style={{ gap: '1rem' }}>
                                    {calculateErrorDistribution().map((stat, idx) => (
                                        <div key={idx} className="card" style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                                    Q{idx + 1}. {stat.question}
                                                </h4>
                                                <span className="badge" style={{
                                                    background: stat.errorRate > 50 ? '#fef2f2' : '#f0fdf4',
                                                    color: stat.errorRate > 50 ? '#ef4444' : '#16a34a',
                                                    border: `1px solid ${stat.errorRate > 50 ? '#fecaca' : '#bbf7d0'}`
                                                }}>
                                                    {stat.errorRate}% Error Rate
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${stat.errorRate}%`,
                                                    background: stat.errorRate > 50 ? '#ef4444' : '#22c55e',
                                                    transition: 'width 0.5s ease'
                                                }} />
                                            </div>

                                            {/* Wrong Answers Breakdown */}
                                            {stat.wrongCount > 0 && (
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    <strong style={{ color: 'var(--text-main)' }}>Common Mistakes:</strong>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                        {Object.entries(stat.wrongAnswers).map(([opt, count]) => (
                                                            <span key={opt} style={{
                                                                background: '#f3f4f6',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                Option {opt}: {count} student{count > 1 ? 's' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {calculateErrorDistribution().length === 0 && (
                                        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            No data available for analysis yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                type={modal.type}
            >
                {modal.content}
            </Modal>
        </div>
    );
}
