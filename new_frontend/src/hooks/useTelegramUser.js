// Получение и хук для данных Telegram-пользователя
export function getTelegramUser() {
    // Логируем для отладки
    console.log('window.Telegram:', window.Telegram);
    console.log('window.Telegram?.WebApp:', window.Telegram?.WebApp);
    console.log('window.Telegram?.WebApp?.initDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);
    console.log('window.Telegram?.WebApp?.initDataUnsafe?.user:', window.Telegram?.WebApp?.initDataUnsafe?.user);

    if (
        typeof window !== "undefined" &&
        window.Telegram &&
        window.Telegram.WebApp &&
        window.Telegram.WebApp.initDataUnsafe &&
        window.Telegram.WebApp.initDataUnsafe.user
    ) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        return {
            id: tgUser.id,
            firstName: tgUser.first_name || "",
            lastName: tgUser.last_name || "",
            username: tgUser.username || "",
            photoUrl: tgUser.photo_url || null,
            languageCode: tgUser.language_code || null,
            isPremium: tgUser.is_premium || false,
            initials: `${tgUser.first_name?.[0] || ""}${tgUser.last_name?.[0] || ""}`,
        };
    }
    // Fallback для локальной разработки
    return {
        id: 1,
        firstName: "Тест",
        lastName: "Пользователь",
        username: "testuser",
        photoUrl: null,
        languageCode: "ru",
        isPremium: false,
        initials: "ТП",
    };
}

export function useTelegramUser() {
    // Просто возвращаем текущего пользователя Telegram
    return getTelegramUser();
} 