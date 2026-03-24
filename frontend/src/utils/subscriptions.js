export function formatRuDate(value) {
    if (!value) {
        return 'Не указано';
    }

    return new Date(value).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function getDaysLeft(value) {
    if (!value) {
        return 0;
    }

    const diff = new Date(value).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatSubscriptionPlan(subscription) {
    if (!subscription) {
        return 'Подписка не найдена';
    }

    return `${subscription.duration} дней`;
}

export function formatSubscriptionStatus(subscription) {
    if (!subscription?.status) {
        return 'Неактивна';
    }

    const map = {
        active: 'Активна',
        expired: 'Истекла',
        canceled: 'Отменена',
        pending: 'Ожидает оплаты',
    };

    return map[subscription.status] || subscription.status;
}

export function formatProtocols(protocolTypes) {
    if (!protocolTypes?.length) {
        return 'Не указаны';
    }

    return protocolTypes.map((protocol) => String(protocol).toUpperCase()).join(', ');
}

export function formatRegion(subscription) {
    if (!subscription?.name) {
        return 'Не указан';
    }

    return subscription.code ? `${subscription.flag} ${subscription.name} (${subscription.code})` : `${subscription.flag} ${subscription.name}`;
}

export function hasActiveSubscription(subscription) {
    return subscription?.status === 'active';
}
