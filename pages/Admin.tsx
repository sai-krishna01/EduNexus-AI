
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { User, SystemSettings, SupportTicket, UserRole } from '../types';
import { ToastType } from '../components/Toast';

interface AdminProps {
    user: User;
    notify: (type: ToastType, msg: string) => void;
}

const AdminPanel: React.FC<AdminProps> = ({ user, notify }) => {
    const [tab, setTab] = useState<'USERS' | 'SETTINGS' | 'SUPPORT'>('SETTINGS');
    const [users, setUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [reply, setReply] = useState('');

    useEffect(() => {
        loadData();
    }, [tab]);

    const loadData = async () => {
        setUsers(await db.getAllUsers());
        setSettings(await db.getSettings());
        setTickets(await db.getTickets());
    };

    const toggleSetting = async (key: keyof SystemSettings) => {
        if (!settings) return;
        const newSettings = { ...settings, [key]: !settings[key] };
        await db.updateSettings(newSettings);
        setSettings(newSettings);
        notify('INFO', `Protocol ${key} updated.`);
    };

    const handleUserAction = async (target: User, action: 'BLOCK' | 'UNBLOCK' | 'DELETE') => {
        if (target.role === UserRole.FOUNDER) {
            notify('ERROR', "Cannot modify Founder protocols.");
            return;
        }
        if (action === 'DELETE') {
            if (confirm("Delete user?")) {
                await db.deleteUser(target.id);
                notify('SUCCESS', `User ${target.username} terminated.`);
                loadData();
            }
        } else {
            await db.updateUser({ ...target, isBlocked: action === 'BLOCK' });
            notify('SUCCESS', `User status updated: ${action}`);
            loadData();
        }
    };

    const resolveTicket = async (t: SupportTicket) => {
        if (!reply) return;
        await db.updateTicket({ ...t, adminReply: reply, status: 'RESOLVED' });
        setReply('');
        loadData();
        notify('SUCCESS', "Ticket resolved and transmission sent.");
    };

    if (!settings) return null;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight">Command Center</h2>
            
            <div className="flex space-x-2 mb-8 border-b border-slate-200 pb-1 overflow-x-auto">
                {['SETTINGS', 'USERS', 'SUPPORT'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-t-xl transition-colors whitespace-nowrap ${tab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'SETTINGS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">System Protocols</h3>
                        <div className="space-y-6">
                            <Toggle label="Maintenance Mode" active={settings.maintenanceMode} onClick={() => toggleSetting('maintenanceMode')} danger />
                            <Toggle label="AI Teacher System" active={settings.enableAiTeacher} onClick={() => toggleSetting('enableAiTeacher')} />
                            <Toggle label="File Uploads" active={settings.enableFileUploads} onClick={() => toggleSetting('enableFileUploads')} />
                            <Toggle label="YouTube Analysis" active={settings.enableYouTubeAnalysis} onClick={() => toggleSetting('enableYouTubeAnalysis')} />
                            <Toggle label="Chat System" active={settings.enableChat} onClick={() => toggleSetting('enableChat')} />
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Financial Controls</h3>
                        <div className="space-y-6">
                            <Toggle label="Enable Payments" active={settings.enablePayments} onClick={() => toggleSetting('enablePayments')} />
                            <Toggle label="Display Ads (Free Tier)" active={settings.enableAds} onClick={() => toggleSetting('enableAds')} />
                        </div>
                        <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                             <div>
                                 <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Revenue Estimate</div>
                                 <div className="text-3xl font-black text-emerald-600">$4,290.00</div>
                             </div>
                             <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">$</div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'USERS' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-slate-800">{u.fullName}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-1">{u.username}</div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${u.subscription === 'FREE' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {u.subscription || 'FREE'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        {u.isBlocked ? <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">BLOCKED</span> : <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">ACTIVE</span>}
                                    </td>
                                    <td className="p-6 text-right space-x-3">
                                        {u.role !== 'FOUNDER' && (
                                            <>
                                                <button onClick={() => handleUserAction(u, u.isBlocked ? 'UNBLOCK' : 'BLOCK')} className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wide">{u.isBlocked ? 'Unblock' : 'Block'}</button>
                                                <button onClick={() => handleUserAction(u, 'DELETE')} className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wide">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'SUPPORT' && (
                <div className="space-y-6">
                    {tickets.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active tickets found</p>
                        </div>
                    )}
                    {tickets.map(t => (
                        <div key={t.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900">{t.subject}</h4>
                                    <div className="text-xs text-slate-400 font-mono mt-1">From: {t.userName} &lt;{t.email}&gt;</div>
                                </div>
                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl text-sm text-slate-700 font-medium leading-relaxed mb-6">
                                {t.message}
                            </div>
                            {t.adminReply ? (
                                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Official Response</span>
                                    <p className="text-sm text-indigo-900 font-medium">{t.adminReply}</p>
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <input 
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                        placeholder="Type solution protocol..."
                                        value={reply}
                                        onChange={e => setReply(e.target.value)}
                                    />
                                    <button onClick={() => resolveTicket(t)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200">Transmit</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Toggle: React.FC<{ label: string; active: boolean; onClick: () => void; danger?: boolean }> = ({ label, active, onClick, danger }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-indigo-100 transition-colors">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <button onClick={onClick} className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${active ? (danger ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-300'}`}>
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${active ? 'left-7' : 'left-1'}`}></div>
        </button>
    </div>
);

export default AdminPanel;
