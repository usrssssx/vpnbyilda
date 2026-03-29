import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    clearConnectionProgress,
    getConnectionProgress,
    setConnectionProgress,
} from '../utils/connectionProgress';
import { getSubscriptionState } from '../utils/subscriptions';

export function useConnectionState(subscription) {
    const subscriptionId = subscription?.id || '';
    const baseState = getSubscriptionState(subscription);
    const [progress, setProgress] = useState(() => getConnectionProgress(subscriptionId));

    useEffect(() => {
        setProgress(getConnectionProgress(subscriptionId));
    }, [subscriptionId]);

    useEffect(() => {
        if (!subscriptionId) {
            return;
        }

        if (baseState !== 'active' && baseState !== 'expiring') {
            clearConnectionProgress(subscriptionId);
            setProgress({ hasSeenConfig: false, hasCopiedConfig: false, connectedLocally: false });
        }
    }, [baseState, subscriptionId]);

    const state = useMemo(() => {
        if ((baseState === 'active' || baseState === 'expiring') && progress.connectedLocally) {
            return 'connected';
        }
        return baseState;
    }, [baseState, progress.connectedLocally]);

    const markSeenConfig = useCallback(() => {
        const next = setConnectionProgress(subscriptionId, { hasSeenConfig: true });
        setProgress(next);
    }, [subscriptionId]);

    const markCopiedConfig = useCallback(() => {
        const next = setConnectionProgress(subscriptionId, {
            hasSeenConfig: true,
            hasCopiedConfig: true,
            connectedLocally: true,
        });
        setProgress(next);
    }, [subscriptionId]);

    return {
        connectionState: state,
        progress,
        markSeenConfig,
        markCopiedConfig,
    };
}
