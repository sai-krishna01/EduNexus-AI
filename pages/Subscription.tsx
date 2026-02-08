
import React, { useState } from 'react';
import { User, SubscriptionPlan } from '../types';
import { db } from '../services/db';

const Subscription: React.FC<{ user: User }> = ({ user }) => {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async (plan: SubscriptionPlan) => {
        setLoading(true);
        // SIMULATED PAYMENT GATEWAY (Razorpay Style)
        await new Promise(r => setTimeout(r, 1500));
        
        if (confirm(`Confirm upgrade to ${plan} Plan? (Simulated Payment)`)) {
            const updatedUser = { ...user, subscription: plan };
            await db.updateUser(updatedUser);
            // In a real app, we would verify payment signature here
            alert("Upgrade Successful! Welcome to the new tier.");
            window.location.reload();
        }
        setLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Upgrade Your Neural Link</h2>
            <p className="text-slate-500 mb-12 max-w-2xl mx-auto">Unlock the full potential of Prof. Nexus with extended context windows, file uploads, and advanced study tools.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {/* Free Plan */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 relative opacity-70">
                    <h3 className="text-lg font-bold text-slate-900">Student</h3>
                    <div className="text-4xl font-extrabold text-slate-900 mt-4 mb-2">$0</div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Forever Free</p>
                    <ul className="space-y-4 mb-8 text-sm text-slate-600">
                        <li className="flex items-center"><Check /> Basic AI Chat</li>
                        <li className="flex items-center"><Check /> Public Groups</li>
                        <li className="flex items-center"><Check /> 2MB File Limit</li>
                        <li className="flex items-center text-slate-400"><X /> No YouTube Analysis</li>
                    </ul>
                    <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wide">Current Plan</button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white p-8 rounded-3xl border-2 border-indigo-600 shadow-2xl shadow-indigo-200 relative transform md:-translate-y-4">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
                    <h3 className="text-lg font-bold text-indigo-600">Scholar Pro</h3>
                    <div className="text-4xl font-extrabold text-slate-900 mt-4 mb-2">$9</div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Per Month</p>
                    <ul className="space-y-4 mb-8 text-sm text-slate-600">
                        <li className="flex items-center"><Check /> Advanced AI Teacher</li>
                        <li className="flex items-center"><Check /> Unlimited Groups</li>
                        <li className="flex items-center"><Check /> 50MB File Limit</li>
                        <li className="flex items-center"><Check /> YouTube Analysis</li>
                        <li className="flex items-center"><Check /> Ad-Free Experience</li>
                    </ul>
                    {user.subscription === 'PRO' ? (
                        <button disabled className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-wide">Active</button>
                    ) : (
                        <button onClick={() => handleUpgrade('PRO')} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-indigo-700 shadow-lg">
                            {loading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                    )}
                </div>

                {/* Enterprise */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 relative">
                    <h3 className="text-lg font-bold text-slate-900">Institution</h3>
                    <div className="text-4xl font-extrabold text-slate-900 mt-4 mb-2">$29</div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Per Month</p>
                    <ul className="space-y-4 mb-8 text-sm text-slate-600">
                        <li className="flex items-center"><Check /> Everything in Pro</li>
                        <li className="flex items-center"><Check /> Private AI Groups</li>
                        <li className="flex items-center"><Check /> Priority Support</li>
                        <li className="flex items-center"><Check /> Early Access Features</li>
                    </ul>
                    {user.subscription === 'ENTERPRISE' ? (
                         <button disabled className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-wide">Active</button>
                    ) : (
                        <button onClick={() => handleUpgrade('ENTERPRISE')} disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-slate-800">
                            {loading ? 'Processing...' : 'Contact Sales'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Check = () => <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const X = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;

export default Subscription;
