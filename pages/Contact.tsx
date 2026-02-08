
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';

const Contact: React.FC<{ user: User }> = ({ user }) => {
    const [msg, setMsg] = useState({ subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.createTicket({
            id: `req_${Date.now()}`,
            userId: user.id,
            userName: user.fullName,
            email: user.email,
            subject: msg.subject,
            message: msg.message,
            timestamp: Date.now(),
            status: 'OPEN'
        });
        setSent(true);
    };

    if (sent) return (
        <div className="max-w-md mx-auto mt-20 text-center bg-white p-10 rounded-3xl shadow-sm border border-emerald-100">
            <h3 className="text-xl font-bold text-emerald-600 mb-2">Transmission Sent</h3>
            <p className="text-slate-500">Admins will review your message shortly.</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Support Uplink</h2>
            <form onSubmit={submit} className="space-y-4">
                <input 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Subject"
                    required
                    value={msg.subject}
                    onChange={e => setMsg({...msg, subject: e.target.value})}
                />
                <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                    placeholder="Message..."
                    required
                    value={msg.message}
                    onChange={e => setMsg({...msg, message: e.target.value})}
                />
                <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl uppercase tracking-wide hover:bg-slate-800">
                    Send Transmission
                </button>
            </form>
        </div>
    );
};

export default Contact;
