import { act, renderHook, waitFor } from '@testing-library/react';
import { useSubscriptionDetails, useSubscriptions } from '../useSubscriptions';
import { subscriptionActive, subscriptionCanceled, configListSingle } from '../../test/fixtures';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../services/api', () => ({
    fetchSubscription: vi.fn(),
    fetchSubscriptionConfig: vi.fn(),
    fetchUserSubscriptions: vi.fn(),
    getSubscriptionPrice: vi.fn(),
}));

describe('useSubscriptions hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns empty state without user id', async () => {
        useAuth.mockReturnValue({ user: null });

        const { result } = renderHook(() => useSubscriptions());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.subscriptions).toEqual([]);
    });

    test('loads subscriptions and derives active/latest subscription', async () => {
        useAuth.mockReturnValue({ user: { id: 'user-1' } });
        api.fetchUserSubscriptions.mockResolvedValue([subscriptionCanceled, subscriptionActive]);

        const { result } = renderHook(() => useSubscriptions());

        await waitFor(() => expect(result.current.subscriptions).toHaveLength(2));
        expect(result.current.activeSubscriptions).toEqual([subscriptionActive]);
        expect(result.current.latestSubscription).toEqual(subscriptionActive);
    });

    test('stores loading error', async () => {
        useAuth.mockReturnValue({ user: { id: 'user-1' } });
        api.fetchUserSubscriptions.mockRejectedValue({ response: { data: { detail: 'boom' } } });

        const { result } = renderHook(() => useSubscriptions());

        await waitFor(() => expect(result.current.error).toBe('boom'));
    });

    test('useSubscriptionDetails loads price and configs for active subscription', async () => {
        useAuth.mockReturnValue({ user: { id: 'user-1' } });
        api.fetchUserSubscriptions.mockResolvedValue([subscriptionActive]);
        api.fetchSubscriptionConfig.mockResolvedValue(configListSingle);
        api.getSubscriptionPrice.mockResolvedValue({ price: 123 });

        const { result } = renderHook(() => useSubscriptionDetails());

        await waitFor(() => expect(result.current.subscription?.id).toBe(subscriptionActive.id));
        expect(api.fetchSubscriptionConfig).toHaveBeenCalledWith(subscriptionActive.id);
        expect(result.current.configs).toEqual(configListSingle);
        expect(result.current.price).toBe(123);
    });

    test('useSubscriptionDetails skips config fetch for inactive subscription', async () => {
        useAuth.mockReturnValue({ user: { id: 'user-1' } });
        api.fetchUserSubscriptions.mockResolvedValue([subscriptionCanceled]);
        api.getSubscriptionPrice.mockResolvedValue({ price: 123 });

        const { result } = renderHook(() => useSubscriptionDetails());

        await waitFor(() => expect(result.current.subscription?.id).toBe(subscriptionCanceled.id));
        expect(api.fetchSubscriptionConfig).not.toHaveBeenCalled();
        expect(api.getSubscriptionPrice).toHaveBeenCalled();
        expect(result.current.configs).toEqual([]);
    });

    test('reload triggers repeated detail load', async () => {
        useAuth.mockReturnValue({ user: { id: 'user-1' } });
        api.fetchUserSubscriptions.mockResolvedValue([subscriptionActive]);
        api.fetchSubscriptionConfig.mockResolvedValue(configListSingle);
        api.getSubscriptionPrice.mockResolvedValue({ price: 123 });

        const { result } = renderHook(() => useSubscriptionDetails());

        await waitFor(() => expect(api.fetchSubscriptionConfig).toHaveBeenCalledTimes(1));
        await act(async () => {
            result.current.reload();
        });
        await waitFor(() => expect(api.fetchSubscriptionConfig).toHaveBeenCalledTimes(2));
    });
});
