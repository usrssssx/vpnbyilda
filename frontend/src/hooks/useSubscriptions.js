import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    fetchSubscription,
    fetchSubscriptionConfig,
    fetchUserSubscriptions,
    getSubscriptionPrice,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useSubscriptions() {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadSubscriptions = useCallback(async () => {
        if (!user?.id) {
            setSubscriptions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = await fetchUserSubscriptions(user.id);
            setSubscriptions(data);
        } catch (loadError) {
            setError(loadError?.response?.data?.detail || 'Не удалось загрузить подписки.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadSubscriptions();
    }, [loadSubscriptions]);

    const latestSubscription = useMemo(() => (
        subscriptions.find((item) => item.status === 'active') || subscriptions[0] || null
    ), [subscriptions]);
    const activeSubscriptions = useMemo(
        () => subscriptions.filter((item) => item.status === 'active'),
        [subscriptions]
    );

    return {
        subscriptions,
        activeSubscriptions,
        latestSubscription,
        isLoading,
        error,
        reloadSubscriptions: loadSubscriptions,
    };
}

export function useSubscriptionDetails(subscriptionId) {
    const { latestSubscription, isLoading: listLoading, error: listError } = useSubscriptions();
    const [subscription, setSubscription] = useState(null);
    const [configs, setConfigs] = useState([]);
    const [price, setPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const reload = useCallback(() => setReloadKey((value) => value + 1), []);

    useEffect(() => {
        let active = true;

        async function loadDetails() {
            const targetId = subscriptionId || latestSubscription?.id;

            if (!targetId) {
                if (active) {
                    setSubscription(null);
                    setConfigs([]);
                    setPrice(0);
                    setIsLoading(false);
                    setError(listError);
                }
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const subscriptionData = subscriptionId
                    ? await fetchSubscription(targetId)
                    : latestSubscription;
                const pricePromise = getSubscriptionPrice({
                    duration_days: subscriptionData.duration,
                    device_count: subscriptionData.device_count,
                    protocol_types: subscriptionData.protocol_types,
                });
                const configPromise = subscriptionData.status === 'active'
                    ? fetchSubscriptionConfig(targetId)
                    : Promise.resolve([]);
                const [configData, priceData] = await Promise.all([configPromise, pricePromise]);

                if (active) {
                    setSubscription(subscriptionData);
                    setConfigs(configData);
                    setPrice(priceData.price || 0);
                }
            } catch (detailsError) {
                if (active) {
                    setError(detailsError?.response?.data?.detail || 'Не удалось загрузить данные подписки.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        if (!listLoading) {
            loadDetails();
        }

        return () => {
            active = false;
        };
    }, [latestSubscription, listError, listLoading, reloadKey, subscriptionId]);

    return { subscription, configs, price, isLoading: isLoading || listLoading, error, reload };
}
