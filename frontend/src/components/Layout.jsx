import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CreditCard, Home, Settings2 } from 'lucide-react';

const navItems = [
    { to: '/', label: 'Главная', icon: Home, match: (pathname) => pathname === '/' || pathname === '/profile' || pathname === '/vpn' || pathname === '/config' },
    { to: '/tariffs', label: 'Тарифы', icon: CreditCard, match: (pathname) => pathname === '/tariffs' },
    { to: '/account', label: 'Аккаунт', icon: Settings2, match: (pathname) => pathname === '/account' || pathname.startsWith('/subscription') },
];

function NavItem({ to, label, icon: Icon, isActive }) {
    return (
        <NavLink
            to={to}
            className={`flex min-w-0 flex-1 items-center justify-center rounded-2xl px-3 py-3 transition ${
                isActive
                    ? 'bg-white text-black shadow-[0_12px_30px_rgba(255,255,255,0.18)]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
        >
            <span className="flex flex-col items-center gap-1 text-xs font-medium">
                <Icon size={18} />
                <span>{label}</span>
            </span>
        </NavLink>
    );
}

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div
            className="min-h-screen w-full overflow-x-hidden"
            style={{
                background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)',
                backgroundAttachment: 'fixed' // Фиксирует градиент при прокрутке
            }}
        >
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6">
                <main className="flex-1">{children}</main>
                <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[28px] border border-white/10 bg-black/65 p-2 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] lg:static lg:mt-8 lg:w-full lg:max-w-none lg:translate-x-0">
                    <div className="flex items-center gap-2">
                        {navItems.map((item) => (
                            <NavItem
                                key={item.to}
                                to={item.to}
                                label={item.label}
                                icon={item.icon}
                                isActive={item.match(location.pathname)}
                            />
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}
