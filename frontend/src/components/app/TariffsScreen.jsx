import React from 'react';
import { useNavigate } from 'react-router-dom';
import TariffsSheet from './TariffsSheet';
import { useTariffFlow } from '../../hooks/useTariffFlow';

export default function TariffsScreen() {
    const navigate = useNavigate();
    const {
        plans,
        selectedPlan,
        selectedPlanId,
        setSelectedPlanId,
        isSubmitting,
        isRenewalFlow,
        latestSubscription,
        submitSelectedPlan,
    } = useTariffFlow();

    return (
        <TariffsSheet
            plans={plans}
            selectedPlan={selectedPlan}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            isSubmitting={isSubmitting}
            isRenewalFlow={isRenewalFlow}
            latestSubscription={latestSubscription}
            onSubmit={submitSelectedPlan}
            onClose={() => navigate('/')}
            fullscreen
        />
    );
}
