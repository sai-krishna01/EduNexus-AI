
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, UserRole, DEFAULT_SETTINGS } from '../types';

interface AuthProps {
    onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [data, setData] = useState({ username: '', password: '', fullName: '', email: '' });
    const [error, setError] = useState('');
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        db.getSettings().then(s => setIsMaintenance(s.maintenanceMode));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const settings = await db.getSettings();
            
            if (view === 'LOGIN') {
                const user = await db.getUser(data.username);
                if (!user) {
                    setError("Identity not found.");
                    return;
                }
                
                if (settings.maintenanceMode && user.role !== UserRole.ADMIN && user.role !== UserRole.FOUNDER) {
                    setError("MAINTENANCE ACTIVE: Admin access only.");
                    return;
                }

                if (user.isBlocked) {
                    setError("Access Denied: Account Blocked.");
                    return;
                }

                await db.updateUser({ ...user, lastLogin: Date.now() });
                onLogin(user);

            } else {
                if (settings.maintenanceMode) {
                    setError("Registrations disabled during maintenance.");
                    return;
                }

                // MAGIC ROLE ASSIGNMENT FOR DEV PURPOSES
                let role = UserRole.STUDENT;
                if (data.username.toLowerCase().includes('founder')) role = UserRole.FOUNDER;
                else if (data.username.toLowerCase().includes('admin')) role = UserRole.ADMIN;

                const newUser: User = {
                    id: `u_${Date.now()}`,
                    username: data.username,
                    fullName: data.fullName,
                    email: data.email,
                    role: role,
                    subscription: 'FREE',
                    isBlocked: false,
                    createdAt: Date.now(),
                    lastLogin: Date.now()
                };

                await db.createUser(newUser);
                onLogin(newUser);
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : "Authentication failed.");
        }
    };

    const handleGuest = () => {
        if (isMaintenance) {
            setError("Guest access disabled during maintenance.");
            return;
        }
        const guest: User = {
            id: 'guest_' + Date.now(),
            username: 'guest',
            fullName: 'Guest User',
            email: '',
            role: UserRole.GUEST,
            subscription: 'FREE',
            isBlocked: false,
            createdAt: Date.now(),
            lastLogin: Date.now()
        };
        onLogin(guest);
    };

    const quickFounderLogin = () => {
        setData({ ...data, username: 'founder', password: 'password' });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">EduNexus AI</h1>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Secure Access Portal</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {view === 'REGISTER' && (
                        <>
                            <input 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Full Name"
                                required
                                value={data.fullName}
                                onChange={e => setData({...data, fullName: e.target.value})}
                            />
                            <input 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Email Address"
                                type="email"
                                required
                                value={data.email}
                                onChange={e => setData({...data, email: e.target.value})}
                            />
                        </>
                    )}
                    <input 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Username"
                        required
                        value={data.username}
                        onChange={e => setData({...data, username: e.target.value})}
                    />
                    <input 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Password"
                        type="password"
                        required
                        value={data.password}
                        onChange={e => setData({...data, password: e.target.value})}
                    />
                    
                    <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-colors">
                        {view === 'LOGIN' ? 'AUTHENTICATE' : 'INITIALIZE ID'}
                    </button>
                </form>

                <div className="mt-6 space-y-3">
                    <button onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide">
                        {view === 'LOGIN' ? 'Create New Account' : 'Return to Login'}
                    </button>
                    {view === 'LOGIN' && (
                        <>
                            <button onClick={handleGuest} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide">
                                Continue as Guest
                            </button>
                            <button onClick={quickFounderLogin} className="w-full text-xs font-bold text-emerald-500 hover:text-emerald-700 uppercase tracking-wide border border-emerald-100 rounded-lg py-2 mt-4 bg-emerald-50">
                                ⚡ Dev: Quick Login as Founder
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
