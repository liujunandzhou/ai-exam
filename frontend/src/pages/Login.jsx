import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [modal, setModal] = useState({ isOpen: false, title: '', content: '', type: 'info' });

    // Load last used email on component mount
    useEffect(() => {
        const lastEmail = localStorage.getItem('lastLoginEmail');
        if (lastEmail) {
            setEmail(lastEmail);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await signIn(email, password);
            if (error) throw error;

            // Save email to localStorage for next time
            localStorage.setItem('lastLoginEmail', email);

            // Navigation handled by AuthContext listener or PrivateRoute
            // But we can force check or just wait. 
            // Actually, AuthContext listener will update state, but we might need to redirect manually if already on login page.
            // Let's just redirect to root, PrivateRoute will handle role check.
            navigate('/');
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Login Failed',
                content: err.message,
                type: 'error'
            });
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '2rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
                <h2 style={{ textAlign: 'center' }}>Login</h2>
                <form onSubmit={handleLogin} className="flex flex-col">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Don't have an account? <Link to="/register">Register</Link>
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

