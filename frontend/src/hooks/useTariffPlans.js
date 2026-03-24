import { useEffect, useState } from 'react';
import { createSubscription, getSubscriptionPrice } from '../services/api';
import { showAppAlert } from '../utils/telegram';

const PLAN_DEFS = [
    { id: 0, name: '1 месяц', durationDays: 30, discount: 0, savings: 0 },
    { id: 1, name: '3 месяца', durationDays: 90, discount: 15, savings: 0 },
    { id: 2, name: '6 месяцев', durationDays: 180, discount: 20, savings: 0 },
    { id: 3, name: '12 месяцев', durationDays: 365, discount: 35, savings: 0 },
];

export function useTariffPlans(navigate) {
    const [plans, setPlans] = useState(PLAN_DEFS.map((item) => ({ ...item, price: 0, monthlyPrice: 0 })));
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadPrices() {
            const nextPlans = await Promise.all(
                PLAN_DEFS.map(async (plan, index) => {
                    try {
                        const response = await getSubscriptionPrice({
                            duration_days: plan.durationDays,
                            device_count: 1,
                            protocol_types: ['vless'],
                        });
                        const price = Math.round(response.price || 0);
                        const monthlyPrice = Math.round(price / Math.max(1, plan.durationDays / 30));
                        const baseMonthly = index === 0 ? monthlyPrice : Math.round(plans[0]?.price || monthlyPrice);
                        const savings = Math.max(0, baseMonthly * Math.max(1, plan.durationDays / 30) - price);
                        return { ...plan, price, monthlyPrice, savings };
                    } catch {
                        return { ...plan, price: 0, monthlyPrice: 0, savings: 0 };
                    }
                })
            );

            if (active) {
                setPlans(nextPlans);
            }
        }

        loadPrices();

        return () => {
            active = false;
        };
    }, []);

    async function buyPlan(plan) {
        setIsSubmitting(true);

        try {
            const response = await createSubscription({
                duration_days: plan.durationDays,
                device_count: 1,
                protocol_types: ['vless'],
            });
            const url = response?.url || '';

            if (url.startsWith('/')) {
                navigate(url);
            } else if (url) {
                window.location.href = url;
            }
        } catch (error) {
            showAppAlert(error?.response?.data?.detail || 'Не удалось оформить подписку.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return { plans, isSubmitting, buyPlan };
}
