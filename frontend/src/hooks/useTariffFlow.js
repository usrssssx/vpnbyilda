import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from './useSubscriptions';
import { useTariffPlans } from './useTariffPlans';
import { getSubscriptionState } from '../utils/subscriptions';

export function useTariffFlow() {
    const navigate = useNavigate();
    const { plans, isSubmitting, buyPlan } = useTariffPlans(navigate);
    const { latestSubscription } = useSubscriptions();
    const currentState = getSubscriptionState(latestSubscription);
    const isRenewalFlow = currentState !== 'none';
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const defaultPlanId = useMemo(() => {
        if (!plans.length) {
            return 1;
        }
        if (latestSubscription?.duration) {
            const currentPlan = plans.find((plan) => plan.durationDays === latestSubscription.duration);
            if (currentPlan) {
                return currentPlan.id;
            }
        }
        const mediumPlan = plans.find((plan) => plan.durationDays === 90);
        return mediumPlan?.id ?? plans[0].id;
    }, [latestSubscription?.duration, plans]);
    const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);

    useEffect(() => {
        setSelectedPlanId(defaultPlanId);
    }, [defaultPlanId]);

    const selectedPlan = useMemo(
        () => plans.find((plan) => plan.id === selectedPlanId) || plans[0] || null,
        [plans, selectedPlanId]
    );

    const starterPrice = useMemo(
        () => plans.find((plan) => plan.durationDays === 30)?.price || 0,
        [plans]
    );

    const renewalPrice = selectedPlan?.price || 0;

    function openSheet() {
        setIsSheetOpen(true);
    }

    function closeSheet() {
        setIsSheetOpen(false);
    }

    async function submitSelectedPlan() {
        if (!selectedPlan) {
            return;
        }
        await buyPlan(selectedPlan);
    }

    return {
        plans,
        selectedPlan,
        selectedPlanId,
        setSelectedPlanId,
        isSubmitting,
        isSheetOpen,
        openSheet,
        closeSheet,
        submitSelectedPlan,
        starterPrice,
        renewalPrice,
        isRenewalFlow,
        latestSubscription,
    };
}
