
import React, { useEffect } from 'react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'INFO';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toasts: ToastMessage[];
    removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} remove={() => removeToast(t.id)} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: ToastMessage; remove: () => void }> = ({ toast, remove }) => {
    useEffect(() => {
        const timer = setTimeout(remove, 4000);
        return () => clearTimeout(timer);
    }, [remove]);

    const bg = toast.type === 'SUCCESS' ? 'bg-emerald-600' : toast.type === 'ERROR' ? 'bg-red-600' : 'bg-indigo-600';
    const icon = toast.type === 'SUCCESS' ? '✓' : toast.type === 'ERROR' ? '✕' : 'ℹ';

    return (
        <div className={`${bg} text-white px-6 py-4 rounded-xl shadow-xl shadow-slate-200/50 flex items-center space-x-4 min-w-[300px] animate-slide-up`}>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">{icon}</div>
            <p className="text-sm font-bold tracking-wide">{toast.message}</p>
        </div>
    );
};

export default ToastContainer;
