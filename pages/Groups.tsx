
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Group, User } from '../types';

interface GroupsProps {
    user: User;
    onJoinGroup: (id: string) => void;
}

const Groups: React.FC<GroupsProps> = ({ user, onJoinGroup }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', type: 'PUBLIC' as 'PUBLIC' | 'PRIVATE', isAiEnabled: false });

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        const all = await db.getGroups();
        // Filter: Public groups OR Private groups where user is member
        const visible = all.filter(g => g.type === 'PUBLIC' || g.members.includes(user.id));
        setGroups(visible);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const g: Group = {
            id: `g_${Date.now()}`,
            name: newGroup.name,
            description: newGroup.description,
            type: newGroup.type,
            isAiEnabled: newGroup.isAiEnabled,
            createdBy: user.id,
            createdAt: Date.now(),
            members: [user.id]
        };
        await db.createGroup(g);
        setGroups([...groups, g]);
        setShowCreate(false);
        setNewGroup({ name: '', description: '', type: 'PUBLIC', isAiEnabled: false });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        await db.deleteGroup(id);
        loadGroups();
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Learning Communities</h2>
                    <p className="text-slate-500 mt-1">Join a group or start your own collaborative node.</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-slate-800 shadow-lg shadow-slate-200">
                    {showCreate ? 'Cancel' : '+ Create Node'}
                </button>
            </div>

            {showCreate && (
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-50 mb-8 animate-fade-in">
                    <h3 className="font-bold text-slate-800 mb-4">Initialize New Community</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required placeholder="Group Name" className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} />
                            <select className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium outline-none" value={newGroup.type} onChange={e => setNewGroup({...newGroup, type: e.target.value as any})}>
                                <option value="PUBLIC">Public (Visible to All)</option>
                                <option value="PRIVATE">Private (Invite Only)</option>
                            </select>
                        </div>
                        <textarea required placeholder="Description..." className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} />
                        
                        <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <input type="checkbox" id="ai" className="w-5 h-5 text-indigo-600 rounded" checked={newGroup.isAiEnabled} onChange={e => setNewGroup({...newGroup, isAiEnabled: e.target.checked})} />
                            <label htmlFor="ai" className="text-sm font-bold text-indigo-900 cursor-pointer select-none">Enable AI Teacher (Prof. Nexus will reply to members)</label>
                        </div>

                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm tracking-wide">Launch Community</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(g => (
                    <div key={g.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        {g.isAiEnabled && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl uppercase tracking-wider">AI Powered</div>}
                        
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                                {g.name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">{g.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{g.type}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{g.members.length} Members</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[40px]">{g.description}</p>
                        
                        <div className="flex space-x-2">
                            <button onClick={() => onJoinGroup(g.id)} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-700">
                                Access Node
                            </button>
                            {g.createdBy === user.id && (
                                <button onClick={() => handleDelete(g.id)} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Groups;
