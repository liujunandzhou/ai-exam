import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Results() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to dashboard as results are shown there
        const timer = setTimeout(() => {
            navigate('/student');
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="container">
            <h1>Results</h1>
            <p>Results are displayed on your dashboard. Redirecting...</p>
        </div>
    );
}
