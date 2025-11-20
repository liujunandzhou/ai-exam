import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TakeExam from './pages/TakeExam';
import ExamDetail from './pages/ExamDetail';
import Results from './pages/Results';

const PrivateRoute = ({ children, role }) => {
    const { user, profile, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (role && profile?.role !== role) return <Navigate to="/" />;
    return children;
};

const RootRedirect = () => {
    const { user, profile, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (profile?.role === 'teacher') return <Navigate to="/teacher" />;
    if (profile?.role === 'student') return <Navigate to="/student" />;
    return <div>Unknown role</div>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/teacher" element={
                            <PrivateRoute role="teacher">
                                <TeacherDashboard />
                            </PrivateRoute>
                        } />
                        <Route path="/student" element={
                            <PrivateRoute role="student">
                                <StudentDashboard />
                            </PrivateRoute>
                        } />
                        <Route path="/exam/:id" element={
                            <PrivateRoute role="student">
                                <TakeExam />
                            </PrivateRoute>
                        } />
                        <Route path="/exam-detail/:resultId" element={
                            <PrivateRoute role="student">
                                <ExamDetail />
                            </PrivateRoute>
                        } />
                        <Route path="/results" element={
                            <PrivateRoute role="student">
                                <Results />
                            </PrivateRoute>
                        } />
                        <Route path="/" element={<RootRedirect />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
