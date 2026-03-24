export const subscriptionActive = {
    id: 'sub-active',
    duration: 30,
    start_date: '2025-03-01T00:00:00Z',
    expires_at: '2025-03-31T00:00:00Z',
    device_count: 2,
    flag: '🇩🇪',
    name: 'Германия',
    code: 'DE',
    status: 'active',
    protocol_types: ['vless'],
};

export const subscriptionCanceled = {
    ...subscriptionActive,
    id: 'sub-canceled',
    status: 'canceled',
};

export const subscriptionExpired = {
    ...subscriptionActive,
    id: 'sub-expired',
    status: 'expired',
};

export const configListSingle = [
    { config: 'https://sub.example.com/sub-1', protocol_type: null },
];

export const configListMultiple = [
    { config: 'vless://config-1', protocol_type: 'vless' },
    { config: 'trojan://config-2', protocol_type: 'trojan' },
];

export const telegramUserMock = {
    firstName: 'Ivan',
    lastName: 'Petrov',
    username: 'ivanpetrov',
    initials: 'IP',
    photoUrl: null,
};
