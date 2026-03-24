import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getTelegramUser } from "../hooks/useTelegramUser";

const TelegramUserContext = createContext();

export function TelegramUserProvider({ children }) {
    const [user, setUser] = useState(getTelegramUser());

    // Функция для обновления пользователя
    const updateUser = useCallback(() => {
        setUser(getTelegramUser());
    }, []);

    useEffect(() => {
        // Можно обновлять пользователя по таймеру (раз в минуту)
        const interval = setInterval(updateUser, 1000 * 60);
        return () => clearInterval(interval);
    }, [updateUser]);

    return (
        <TelegramUserContext.Provider value={{ user, updateUser }}>
            {children}
        </TelegramUserContext.Provider>
    );
}

export function useTelegramUserContext() {
    return useContext(TelegramUserContext);
} 