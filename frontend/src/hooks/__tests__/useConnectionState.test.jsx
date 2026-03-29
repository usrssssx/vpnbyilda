import { act, renderHook } from '@testing-library/react';
import { useConnectionState } from '../useConnectionState';
import { subscriptionActive, subscriptionExpired } from '../../test/fixtures';

describe('useConnectionState', () => {
    let storage;

    beforeEach(() => {
        storage = {};
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: {
                getItem: vi.fn((key) => storage[key] ?? null),
                setItem: vi.fn((key, value) => {
                    storage[key] = String(value);
                }),
                removeItem: vi.fn((key) => {
                    delete storage[key];
                }),
            },
        });
    });

    test('returns connected after config copy for active subscription', () => {
        const { result } = renderHook(() => useConnectionState(subscriptionActive));

        expect(result.current.connectionState).toBe('active');

        act(() => {
            result.current.markSeenConfig();
        });

        expect(result.current.progress.hasSeenConfig).toBe(true);
        expect(result.current.connectionState).toBe('active');

        act(() => {
            result.current.markCopiedConfig();
        });

        expect(result.current.progress.connectedLocally).toBe(true);
        expect(result.current.connectionState).toBe('connected');
    });

    test('clears local progress when subscription is no longer active', () => {
        storage.vpn_connection_progress = JSON.stringify({
            [subscriptionExpired.id]: {
                hasSeenConfig: true,
                hasCopiedConfig: true,
                connectedLocally: true,
            },
        });

        const { result } = renderHook(() => useConnectionState(subscriptionExpired));

        expect(result.current.connectionState).toBe('expired');
        expect(result.current.progress).toEqual({
            hasSeenConfig: false,
            hasCopiedConfig: false,
            connectedLocally: false,
        });
    });
});
