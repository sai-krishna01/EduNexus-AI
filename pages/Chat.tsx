
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { generateTeacherResponse, analyzeDocument, AiIntent } from '../services/geminiService';
import { User, Message, SystemSettings, Group } from '../types';

interface ChatProps {
    user: User;
    groupId: string;
    notify: (type: 'SUCCESS' | 'ERROR' | 'INFO', msg: string) => void;
}

const Chat: React.FC<ChatProps> = ({ user, groupId, notify }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [group, setGroup] = useState<Group | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    
    // Derived state
    const isAiChat = groupId === 'ai_lab';
    const isAiEnabledGroup = group?.isAiEnabled || isAiChat;

    useEffect(() => {
        const init = async () => {
            setSettings(await db.getSettings());
            const groups = await db.getGroups();
            setGroup(groups.find(g => g.id === groupId) || null);
        };
        init();
        loadMessages();
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [groupId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const loadMessages = async () => {
        const msgs = await db.getMessages(groupId);
        setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
    };

    const handleSend = async (e?: React.FormEvent, explicitIntent?: AiIntent) => {
        if (e) e.preventDefault();
        const textToSend = input.trim() || (explicitIntent ? `Generate ${explicitIntent}` : '');
        
        if ((!textToSend && !file) || !settings) return;

        if (settings.maintenanceMode && user.role !== 'ADMIN' && user.role !== 'FOUNDER') {
            notify('ERROR', "Maintenance protocols active.");
            return;
        }

        let fileContext = '';
        const attachments = [];
        if (file) {
            if (!settings.enableFileUploads) {
                notify('ERROR', "Uploads disabled by admin.");
                return;
            }
            try {
                setLoading(true);
                const reader = new FileReader();
                const base64 = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
                const rawBase64 = base64.split(',')[1];
                
                if (isAiEnabledGroup) {
                    fileContext = await analyzeDocument(rawBase64, file.type);
                    notify('SUCCESS', "Nodal Data Extracted");
                }

                attachments.push({
                    id: Date.now().toString(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: rawBase64
                });
            } catch (err) {
                notify('ERROR', "File processing failed.");
                setLoading(false);
                return;
            }
        }

        const userMsg: Message = {
            id: `msg_${Date.now()}`,
            groupId,
            userId: user.id,
            userName: user.fullName,
            content: textToSend,
            timestamp: Date.now(),
            isAi: false,
            attachments: attachments.length ? attachments : undefined
        };

        await db.addMessage(userMsg);
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setFile(null);
        setLoading(false);

        const shouldAiReply = isAiChat || (group?.isAiEnabled && (textToSend.toLowerCase().includes('@ai') || explicitIntent));
        
        if (shouldAiReply && settings.enableAiTeacher) {
            setLoading(true);
            try {
                const response = await generateTeacherResponse(
                    textToSend,
                    messages,
                    user,
                    settings,
                    fileContext,
                    explicitIntent || 'TEACH'
                );

                const aiMsg: Message = {
                    id: `ai_${Date.now()}`,
                    groupId,
                    userId: 'AI_TEACHER',
                    userName: 'Prof. Nexus',
                    content: response,
                    timestamp: Date.now(),
                    isAi: true
                };
                await db.addMessage(aiMsg);
                setMessages(prev => [...prev, aiMsg]);
            } catch (e) {
                notify('ERROR', "Neural Link Unstable.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative border border-slate-100">
            
            {/* Learning Lab Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center z-10">
                <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${isAiEnabledGroup ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-800 shadow-slate-200'}`}>
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{isAiChat ? 'Learning Lab' : group?.name}</h2>
                        <div className="flex items-center space-x-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master AI Teacher Online</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                     <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center space-x-2 border border-slate-100">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mode:</span>
                         <span className="text-xs font-bold text-slate-900 uppercase">General</span>
                         <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFD]">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <svg className="w-24 h-24 mb-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        <p className="font-bold text-xs uppercase tracking-[0.2em]">Session Initialized. Awaiting Input.</p>
                    </div>
                )}
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-3xl p-6 shadow-sm ${m.isAi ? 'bg-white border border-slate-100 text-slate-800' : m.userId === user.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${m.isAi ? 'text-indigo-500' : 'text-white/70'}`}>{m.userName}</span>
                                <span className={`text-[10px] font-bold opacity-50`}>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed font-medium">
                                {m.content}
                            </div>
                            {m.attachments && m.attachments.length > 0 && (
                                <div className="mt-4 p-3 bg-black/10 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                        <span className="text-xs font-bold">{m.attachments[0].name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Analyzed</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                     <div className="flex justify-start">
                         <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-3">
                             <div className="flex space-x-1">
                                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                             </div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing Nodal Data</span>
                         </div>
                     </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Smart Input Area */}
            <div className="p-8 bg-white/80 backdrop-blur-md absolute bottom-0 w-full">
                {isAiEnabledGroup && (
                    <div className="flex justify-center space-x-4 mb-6">
                        <ActionButton label="Syllabus Summary" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" onClick={() => handleSend(undefined, 'SUMMARY')} />
                        <ActionButton label="Practice Quiz" icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" onClick={() => handleSend(undefined, 'QUIZ')} />
                        <ActionButton label="Notes Synthesis" icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" onClick={() => handleSend(undefined, 'NOTES')} />
                    </div>
                )}

                {/* Grounded Bar */}
                {file && (
                    <div className="mx-auto max-w-4xl bg-indigo-50 border border-indigo-100 rounded-t-2xl p-3 flex justify-between items-center animate-slide-up">
                         <div className="flex items-center space-x-3 text-indigo-700">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                             <span className="text-xs font-bold uppercase tracking-widest">Grounded: {file.name}</span>
                         </div>
                         <button onClick={() => setFile(null)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-900 uppercase tracking-widest">Detach X</button>
                    </div>
                )}

                <form onSubmit={(e) => handleSend(e)} className="mx-auto max-w-4xl bg-slate-50 border border-slate-200 rounded-2xl p-2 flex items-center shadow-inner relative z-20">
                    <label className="p-3 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" title="Attach Nodal Data">
                        <input type="file" className="hidden" onChange={e => e.target.files && setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.txt,.jpg,.png" />
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                    </label>
                    <input 
                        className="flex-1 bg-transparent border-none px-4 py-3 focus:ring-0 outline-none text-sm font-bold text-slate-700 placeholder-slate-400"
                        placeholder="Ask the AI Teacher about the document..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || (!input.trim() && !file)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 hover:scale-105">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

const ActionButton: React.FC<{ label: string; icon: string; onClick: () => void }> = ({ label, icon, onClick }) => (
    <button type="button" onClick={onClick} className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
        <span>{label}</span>
    </button>
);

export default Chat;
