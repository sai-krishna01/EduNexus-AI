
import React from 'react';
import { User } from '../types';

const Profile: React.FC<{ user: User }> = ({ user }) => {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-200">
                    {user.username[0].toUpperCase()}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{user.fullName}</h2>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Role: {user.role}</p>
                    <p className="text-sm text-slate-400 font-mono mt-1">ID: {user.id}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-8">
                 <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                     <div className="text-slate-800 font-medium">{user.email || 'N/A'}</div>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Status</label>
                     <div className="text-emerald-600 font-bold uppercase text-sm">Active & Verified</div>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Member Since</label>
                     <div className="text-slate-800 font-medium">{new Date(user.createdAt).toLocaleDateString()}</div>
                 </div>
            </div>
        </div>
    );
};

export default Profile;
