import React from 'react';
import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './contexts/AuthContext';

function FullScreenState({ title, description }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="mt-3 text-sm opacity-80">{description}</p>
            </div>
        </div>
    );
}

function App() {
    const { isLoading, isAuthenticated, error } = useAuth();

    if (isLoading) {
        return <FullScreenState title="Подключение" description="Загружаю данные пользователя и подписки." />;
    }

    if (!isAuthenticated) {
        return (
            <FullScreenState
                title="Открой Mini App из Telegram"
                description={error || 'Для входа нужен Telegram WebApp. Открой приложение через бота.'}
            />
        );
    }

    return (
        <Layout>
            <AppRoutes />
        </Layout>
    );
}

export default App;
