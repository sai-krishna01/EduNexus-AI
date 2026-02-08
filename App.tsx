
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { db } from './services/db';
import Auth from './pages/Auth';
import Layout from './components/Layout';
import AdminPanel from './pages/Admin';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import Contact from './pages/Contact';
import Subscription from './pages/Subscription';
import ToastContainer, { ToastMessage, ToastType } from './components/Toast';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const restoreSession = async () => {
            const uid = sessionStorage.getItem('edu_uid');
            if (uid) {
                const u = await db.getUserById(uid);
                if (u && !u.isBlocked) setUser(u);
            }
            setLoading(false);
        };
        restoreSession();
    }, []);

    const handleLogin = (u: User) => {
        sessionStorage.setItem('edu_uid', u.id);
        setUser(u);
        setPage('dashboard');
        notify('SUCCESS', `Identity Verified: ${u.username}`);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('edu_uid');
        setUser(null);
        notify('INFO', "Session Terminated");
    };

    const notify = (type: ToastType, message: string) => {
        setToasts(prev => [...prev, { id: Date.now().toString(), type, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
             <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
             <div className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Initializing Neural Core...</div>
        </div>
    );

    if (!user) return <Auth onLogin={handleLogin} />;

    return (
        <Layout user={user} activePage={page} onNavigate={setPage} onLogout={handleLogout}>
            {page === 'dashboard' && (
                <div className="max-w-6xl mx-auto">
                    {/* Welcome Banner */}
                    <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl shadow-slate-300 mb-10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-5xl font-black tracking-tight mb-4">Welcome back, {user.fullName.split(' ')[0]}</h2>
                            <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">Your neural learning node is online. System extraction tools are ready for deployment.</p>
                            <div className="flex space-x-4 mt-8">
                                <button onClick={() => setPage('ai_lab')} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all hover:scale-105">
                                    Open Learning Lab
                                </button>
                                {user.subscription === 'FREE' && (
                                    <button onClick={() => setPage('subscription')} className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
                                        Upgrade Node
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] -mr-20 -mt-20 opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                             <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             </div>
                             <div>
                                 <div className="text-2xl font-black text-slate-900">Active</div>
                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</div>
                             </div>
                         </div>
                         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                             <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                             </div>
                             <div>
                                 <div className="text-2xl font-black text-slate-900">{user.role}</div>
                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Level</div>
                             </div>
                         </div>
                         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                             <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             </div>
                             <div>
                                 <div className="text-2xl font-black text-slate-900">0.04s</div>
                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latency</div>
                             </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div onClick={() => setPage('groups')} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group">
                             <div className="flex items-center space-x-4 mb-4">
                                 <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                     <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                 </div>
                                 <div>
                                     <h3 className="text-xl font-bold text-slate-900">Communities</h3>
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect Nodes</p>
                                 </div>
                             </div>
                             <p className="text-slate-500 text-sm leading-relaxed">Join collaborative study groups or initiate private knowledge nodes for focused learning.</p>
                        </div>
                        <div onClick={() => setPage('contact')} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group">
                             <div className="flex items-center space-x-4 mb-4">
                                 <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                     <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                 </div>
                                 <div>
                                     <h3 className="text-xl font-bold text-slate-900">Support Desk</h3>
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Uplink</p>
                                 </div>
                             </div>
                             <p className="text-slate-500 text-sm leading-relaxed">Direct line to platform administrators for priority assistance and system feedback.</p>
                        </div>
                    </div>
                </div>
            )}
            {page === 'admin' && <AdminPanel user={user} notify={notify} />}
            {page === 'ai_lab' && <Chat user={user} groupId="ai_lab" notify={notify} />}
            {page === 'subscription' && <Subscription user={user} />}
            {page === 'groups' && <Groups user={user} onJoinGroup={(gid) => { setPage('chat_group_' + gid); notify('SUCCESS', "Node Connected"); }} />}
            {page.startsWith('chat_group_') && <Chat user={user} groupId={page.replace('chat_group_', '')} notify={notify} />}
            {page === 'profile' && <Profile user={user} />}
            {page === 'contact' && <Contact user={user} />}
            
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </Layout>
    );
};

export default App;
