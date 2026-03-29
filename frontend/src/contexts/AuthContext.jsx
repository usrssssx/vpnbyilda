import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    fetchMe,
    getPersistedUser,
    loginByTelegram,
    persistUser,
    refreshSession,
    setAccessToken,
} from '../services/api';
import {
    getTelegramInitData,
    initTelegramWebApp,
    waitForTelegramInitData,
    waitForTelegramWebApp,
} from '../utils/telegram';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getPersistedUser());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function boot() {
            setIsLoading(true);
            setError('');

            try {
                let initData = '';
                const webApp = await waitForTelegramWebApp();

                if (webApp) {
                    initTelegramWebApp();
                    initData = getTelegramInitData() || await waitForTelegramInitData();
                }

                if (initData) {
                    try {
                        await loginByTelegram(initData);
                    } catch (loginError) {
                        await new Promise((resolve) => window.setTimeout(resolve, 350));
                        await loginByTelegram(initData);
                    }
                } else {
                    await refreshSession();
                }

                const me = await fetchMe();

                if (active) {
                    setUser(me);
                }
            } catch (bootError) {
                setAccessToken('');
                persistUser(null);

                if (active) {
                    setUser(null);
                    setError(
                        bootError?.response?.data?.detail ||
                        'Не удалось авторизоваться через Telegram.'
                    );
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        boot();

        return () => {
            active = false;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: Boolean(user),
                error,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
