import { fireEvent, render, screen } from '@testing-library/react';
import TariffsScreen from '../app/TariffsScreen';
import { subscriptionActive } from '../../test/fixtures';
import { useTariffFlow } from '../../hooks/useTariffFlow';

const navigate = vi.fn();
const submitSelectedPlan = vi.fn();
const setSelectedPlanId = vi.fn();

vi.mock('../../hooks/useTariffFlow', () => ({
    useTariffFlow: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

describe('TariffsScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        navigate.mockReset();
        submitSelectedPlan.mockReset();
        setSelectedPlanId.mockReset();
        useTariffFlow.mockReturnValue({
            plans: [
                { id: 0, name: '1 месяц', durationDays: 30, price: 60, monthlyPrice: 60, savings: 0 },
                { id: 1, name: '3 месяца', durationDays: 90, price: 180, monthlyPrice: 60, savings: 30 },
                { id: 2, name: '6 месяцев', durationDays: 180, price: 300, monthlyPrice: 50, savings: 60 },
            ],
            selectedPlan: { id: 0, name: '1 месяц', durationDays: 30, price: 60, monthlyPrice: 60, savings: 0 },
            selectedPlanId: 0,
            setSelectedPlanId,
            isSubmitting: false,
            isRenewalFlow: true,
            latestSubscription: subscriptionActive,
            submitSelectedPlan,
        });
    });

    test('shows current tariff badge and renew CTA for existing subscription', () => {
        render(<TariffsScreen />);

        expect(screen.getByText('Текущий тариф')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Продлить и перейти к оплате/i })).toBeInTheDocument();
    });

    test('submits selected plan', () => {
        useTariffFlow.mockReturnValue({
            plans: [
                { id: 0, name: '1 месяц', durationDays: 30, price: 60, monthlyPrice: 60, savings: 0 },
                { id: 1, name: '3 месяца', durationDays: 90, price: 180, monthlyPrice: 60, savings: 30 },
                { id: 2, name: '6 месяцев', durationDays: 180, price: 300, monthlyPrice: 50, savings: 60 },
            ],
            selectedPlan: { id: 2, name: '6 месяцев', durationDays: 180, price: 300, monthlyPrice: 50, savings: 60 },
            selectedPlanId: 2,
            setSelectedPlanId,
            isSubmitting: false,
            isRenewalFlow: false,
            latestSubscription: null,
            submitSelectedPlan,
        });

        render(<TariffsScreen />);
        fireEvent.click(screen.getByRole('button', { name: /Открыть доступ и перейти к оплате/i }));

        expect(submitSelectedPlan).toHaveBeenCalled();
    });
});
