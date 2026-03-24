export const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    'https://api.vpnbyilda.ru/api/v1'
).replace(/\/$/, '');

export const SUPPORT_URL = import.meta.env.VITE_SUPPORT_URL || 'https://t.me/vpnsupportbyiluda_bot';
