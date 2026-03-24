import {
    formatProtocols,
    formatRegion,
    formatSubscriptionPlan,
    formatSubscriptionStatus,
    hasActiveSubscription,
} from '../subscriptions';

describe('subscriptions utils', () => {
    test('formats subscription status values', () => {
        expect(formatSubscriptionStatus({ status: 'active' })).toBe('Активна');
        expect(formatSubscriptionStatus({ status: 'expired' })).toBe('Истекла');
        expect(formatSubscriptionStatus({ status: 'pending' })).toBe('Ожидает оплаты');
        expect(formatSubscriptionStatus({ status: 'canceled' })).toBe('Отменена');
    });

    test('formats plan/region/protocols', () => {
        expect(formatSubscriptionPlan({ duration: 30 })).toBe('30 дней');
        expect(formatRegion({ flag: '🇩🇪', name: 'Германия', code: 'DE' })).toBe('🇩🇪 Германия (DE)');
        expect(formatProtocols(['vless', 'trojan'])).toBe('VLESS, TROJAN');
    });

    test('detects active subscription', () => {
        expect(hasActiveSubscription({ status: 'active' })).toBe(true);
        expect(hasActiveSubscription({ status: 'canceled' })).toBe(false);
    });
});
