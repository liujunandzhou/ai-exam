import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import { supabase } from '../supabaseClient';

export default function ProfileMenu() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', content: '', type: 'info' });
    const [isEditingName, setIsEditingName] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = () => {
        const username = profile?.username || user?.email || 'U';
        return username.substring(0, 2).toUpperCase();
    };

    const getDisplayName = () => {
        return profile?.username || user?.email?.split('@')[0] || 'User';
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const handleUpdateName = async () => {
        if (!newDisplayName.trim()) {
            setModal({
                isOpen: true,
                title: 'Error',
                content: 'Display name cannot be empty',
                type: 'error'
            });
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username: newDisplayName })
                .eq('id', user.id);

            if (error) throw error;

            setModal({
                isOpen: true,
                title: 'Success',
                content: 'Display name updated successfully!',
                type: 'success'
            });
            setIsEditingName(false);
            setNewDisplayName('');
            // Refresh to update UI
            window.location.reload();
        } catch (error) {
            setModal({
                isOpen: true,
                title: 'Error',
                content: error.message,
                type: 'error'
            });
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            setModal({
                isOpen: true,
                title: 'Error',
                content: 'Password must be at least 6 characters',
                type: 'error'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setModal({
                isOpen: true,
                title: 'Error',
                content: 'Passwords do not match',
                type: 'error'
            });
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setModal({
                isOpen: true,
                title: 'Success',
                content: 'Password changed successfully!',
                type: 'success'
            });
            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setModal({
                isOpen: true,
                title: 'Error',
                content: error.message,
                type: 'error'
            });
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.625rem 1.125rem',
                    background: 'white',
                    border: `2px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isOpen ? '0 4px 12px rgba(99, 102, 241, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transform: isOpen ? 'translateY(-1px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'var(--primary-light)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }
                }}
            >
                {/* Avatar */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    letterSpacing: '0.5px'
                }}>
                    {getInitials()}
                </div>

                {/* Name & Role */}
                <div style={{ textAlign: 'left', minWidth: '120px' }}>
                    <div style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '2px',
                        letterSpacing: '-0.01em'
                    }}>
                        {getDisplayName()}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'capitalize',
                        fontWeight: '500'
                    }}>
                        {profile?.role}
                    </div>
                </div>

                {/* Dropdown Arrow */}
                <div style={{
                    color: isOpen ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    transition: 'all 0.2s',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)'
                }}>
                    ▼
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.75rem)',
                    right: 0,
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
                    minWidth: '300px',
                    zIndex: 1000,
                    overflow: 'hidden',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    <style>
                        {`
                            @keyframes slideDown {
                                from {
                                    opacity: 0;
                                    transform: translateY(-8px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                        `}
                    </style>

                    {/* User Info Header */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.375rem',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Signed in as
                        </div>
                        <div style={{
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            wordBreak: 'break-all'
                        }}>
                            {user?.email}
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ padding: '0.5rem' }}>
                        <button
                            onClick={() => {
                                setIsEditingName(true);
                                setNewDisplayName(profile?.username || '');
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.875rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem',
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--background)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <span style={{ fontSize: '1.1rem' }}>✏️</span>
                            <span>Change Display Name</span>
                        </button>

                        <button
                            onClick={() => {
                                setIsChangingPassword(true);
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.875rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem',
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--background)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <span style={{ fontSize: '1.1rem' }}>🔒</span>
                            <span>Change Password</span>
                        </button>

                        <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0.75rem' }} />

                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.875rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem',
                                color: 'var(--danger)',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fff5f5';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <span style={{ fontSize: '1.1rem' }}>🚪</span>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Name Modal */}
            <Modal
                isOpen={isEditingName}
                onClose={() => {
                    setIsEditingName(false);
                    setNewDisplayName('');
                }}
                title="Change Display Name"
                type="info"
            >
                <div>
                    <input
                        type="text"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        placeholder="Enter new display name"
                        style={{ width: '100%', marginBottom: '1rem' }}
                        autoFocus
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => {
                                setIsEditingName(false);
                                setNewDisplayName('');
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleUpdateName}>
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                isOpen={isChangingPassword}
                onClose={() => {
                    setIsChangingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                }}
                title="Change Password"
                type="info"
            >
                <div>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 characters)"
                        style={{ width: '100%', marginBottom: '0.75rem' }}
                        autoFocus
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        style={{ width: '100%', marginBottom: '1rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => {
                                setIsChangingPassword(false);
                                setNewPassword('');
                                setConfirmPassword('');
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleChangePassword}>
                            Change Password
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Notification Modal */}
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
