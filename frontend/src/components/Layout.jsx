import React from 'react';

export default function Layout({ children }) {
    return (
        <div
            className="min-h-screen w-full overflow-x-hidden"
            style={{
                background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)',
                backgroundAttachment: 'fixed' // Фиксирует градиент при прокрутке
            }}
        >
            {children}
        </div>
    );
}