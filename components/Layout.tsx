
import React, { useEffect, useState } from 'react';
import { User, UserRole, SystemSettings } from '../types';
import { db } from '../services/db';

interface LayoutProps {
    children: React.ReactNode;
    user: User;
    activePage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activePage, onNavigate, onLogout }) => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'VERIFIED' | 'SYNCING'>('VERIFIED');

    useEffect(() => {
        const sync = async () => {
            setSyncStatus('SYNCING');
            const s = await db.getSettings();
            setSettings(s);
            setTimeout(() => setSyncStatus('VERIFIED'), 800);
        };
        sync();
        const interval = setInterval(sync, 10000);
        return () => clearInterval(interval);
    }, []);

    // Maintenance Lockout
    if (settings?.maintenanceMode && user.role !== UserRole.ADMIN && user.role !== UserRole.FOUNDER) {
        return (
            <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h1 className="text-4xl font-bold text-red-500 mb-2 tracking-tighter">SYSTEM LOCKDOWN</h1>
                <p className="text-sm font-mono text-slate-400 mb-8">NODE DISCONNECTED: MAINTENANCE PROTOCOLS ACTIVE</p>
                <button onClick={onLogout} className="bg-red-500/10 border border-red-500 text-red-500 px-8 py-3 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold tracking-widest text-xs uppercase">Terminate Session</button>
            </div>
        );
    }

    const renderNavItem = (id: string, label: string, icon: any) => (
        <button
            onClick={() => { onNavigate(id); setMobileOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all mb-1 ${activePage === id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed z-30 inset-y-0 left-0 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="h-20 flex items-center px-8 border-b border-slate-50">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-indigo-200 shadow-lg">E</div>
                        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">EduNexus AI</h1>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Node Operations */}
                    <div className="mb-8">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 pl-4">Node Operations</h3>
                        {renderNavItem('dashboard', 'Dashboard', 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z')}
                        {renderNavItem('groups', 'Communities', 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z')}
                        <button
                            onClick={() => { onNavigate('ai_lab'); setMobileOpen(false); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mb-1 mt-2 ${activePage === 'ai_lab' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-900 text-white shadow-lg shadow-slate-300'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            <span>Learning Lab</span>
                        </button>
                    </div>

                    {/* System Access */}
                    <div>
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 pl-4">System Access</h3>
                        {renderNavItem('profile', 'Profile Node', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')}
                        {renderNavItem('contact', 'Support Desk', 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z')}
                        {renderNavItem('subscription', 'Subscription', 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z')}
                        {(user.role === UserRole.ADMIN || user.role === UserRole.FOUNDER) && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                {renderNavItem('admin', 'Administrative', 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-50">
                     <div className="bg-slate-50 rounded-2xl p-4 flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</p>
                        </div>
                     </div>
                     <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span>Terminate Session</span>
                     </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-72 relative">
                {/* Header */}
                <header className="h-20 bg-[#F8FAFC] flex items-center justify-between px-8 z-20">
                    <div className="flex items-center space-x-4">
                         <div className="lg:hidden">
                            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </button>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{activePage.replace('_', ' ')}</span>
                             <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{activePage === 'ai_lab' ? 'Global Network' : activePage}</h2>
                         </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full border ${syncStatus === 'VERIFIED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${syncStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Nodal Sync: {syncStatus}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto px-4 pb-4 md:px-8 md:pb-8">
                    {children}
                </main>
                
                {mobileOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileOpen(false)}></div>}
            </div>
        </div>
    );
};

export default Layout;
