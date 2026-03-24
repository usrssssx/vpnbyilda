export function initTelegramWebApp() {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
        return null;
    }

    webApp.ready();
    webApp.expand();
    return webApp;
}

export function getTelegramInitData() {
    return window.Telegram?.WebApp?.initData || '';
}

export function getTelegramUserUnsafe() {
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

export function showAppAlert(message) {
    const webApp = window.Telegram?.WebApp;

    if (webApp?.showAlert) {
        webApp.showAlert(message);
        return;
    }

    window.alert(message);
}

export function openExternalLink(url) {
    const webApp = window.Telegram?.WebApp;

    if (webApp?.openLink) {
        webApp.openLink(url);
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
}

export function confirmAppAction(message) {
    const webApp = window.Telegram?.WebApp;

    if (webApp?.showConfirm) {
        return new Promise((resolve) => {
            webApp.showConfirm(message, resolve);
        });
    }

    return Promise.resolve(window.confirm(message));
}
