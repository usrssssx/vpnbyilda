function getTelegramUser() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tgWebApp = window.Telegram.WebApp;

        if (tgWebApp.initDataUnsafe && tgWebApp.initDataUnsafe.user) {
            const tgUser = tgWebApp.initDataUnsafe.user;

            return {
                firstName: tgUser.first_name || 'Алексей',
                lastName: tgUser.last_name || '',
                username: tgUser.username || 'username',
                initials: `${tgUser.first_name ? tgUser.first_name.charAt(0) : 'А'}${tgUser.last_name ? tgUser.last_name.charAt(0) : ''}`,
                photoUrl: tgUser.photo_url || null
            };
        }
    }

    try {
        const storedUser = JSON.parse(localStorage.getItem('vpn_user') || 'null');

        if (storedUser) {
            const firstName = storedUser.fullname?.split(' ')[0] || storedUser.username || 'Пользователь';
            const lastName = storedUser.fullname?.split(' ').slice(1).join(' ') || '';

            return {
                firstName,
                lastName,
                username: storedUser.username || 'username',
                initials: `${firstName.charAt(0) || 'П'}${lastName.charAt(0) || 'О'}`,
                photoUrl: null
            };
        }
    } catch {
        // ignore localStorage parse errors
    }

    return {
        firstName: 'Алексей',
        lastName: '',
        username: 'username',
        initials: 'А',
        photoUrl: null
    };
}

const TelegramUser = {
    getUser: function () {
        return getTelegramUser();
    },

    renderAvatar: function (className = "w-10 h-10 rounded-full") {
        const user = this.getUser();
        if (user.photoUrl) {
            return `<img src="${user.photoUrl}" alt="Avatar" class="${className}" />`;
        } else {
            return user.initials;
        }
    },

    getFullName: function () {
        const user = this.getUser();
        return `${user.firstName} ${user.lastName}`;
    }
};

export default TelegramUser;
