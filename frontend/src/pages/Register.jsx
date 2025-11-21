import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

export default function Register() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [modal, setModal] = useState({ isOpen: false, title: '', content: '', type: 'info' });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await signUp(email, password, role, username);
            setModal({
                isOpen: true,
                title: 'Registration Successful',
                content: 'Registration successful! Please login.',
                type: 'success'
            });
            // Delay navigation to show modal
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Registration Failed',
                content: err.message,
                type: 'error'
            });
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '2rem' }}>
            {/* Branding */}
            <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    margin: '0 0 0.5rem 0',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em'
                }}>
                    AI Exam
                </h1>
                <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    fontWeight: '400',
                    letterSpacing: '0.05em'
                }}>
                    built by antigravity
                </p>
            </div>

            <div className="card" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
                <h2 style={{ textAlign: 'center' }}>Register</h2>
                <form onSubmit={handleRegister} className="flex flex-col">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
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
