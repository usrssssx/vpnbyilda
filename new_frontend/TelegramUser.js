// TelegramUser.js - глобальный объект для работы с данными пользователя Telegram

// Функция для получения данных пользователя из Telegram
function getTelegramUser() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tgWebApp = window.Telegram.WebApp;

        if (tgWebApp.initDataUnsafe && tgWebApp.initDataUnsafe.user) {
            const tgUser = tgWebApp.initDataUnsafe.user;

            return {
                firstName: tgUser.first_name || 'Алексей',
                lastName: tgUser.last_name || 'Смирнов',
                username: tgUser.username || 'username',
                initials: `${tgUser.first_name ? tgUser.first_name.charAt(0) : 'А'}${tgUser.last_name ? tgUser.last_name.charAt(0) : 'С'}`,
                photoUrl: tgUser.photo_url || null
            };
        }
    }

    // Fallback если данных Telegram нет
    return {
        firstName: 'Алексей',
        lastName: 'Смирнов',
        username: 'username',
        initials: 'АС',
        photoUrl: null
    };
}

// Глобальный объект для доступа к данным пользователя
const TelegramUser = {
    // Получение данных пользователя
    getUser: function () {
        return getTelegramUser();
    },

    // Рендеринг аватарки (фото или инициалы)
    renderAvatar: function (className = "w-10 h-10 rounded-full") {
        const user = this.getUser();
        if (user.photoUrl) {
            return `<img src="${user.photoUrl}" alt="Avatar" class="${className}" />`;
        } else {
            return user.initials;
        }
    },

    // Получение полного имени
    getFullName: function () {
        const user = this.getUser();
        return `${user.firstName} ${user.lastName}`;
    }
};

export default TelegramUser;