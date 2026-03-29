import { fireEvent, render, screen } from '@testing-library/react';
import HomeScreen from '../app/HomeScreen';
import { subscriptionActive } from '../../test/fixtures';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useTariffFlow } from '../../hooks/useTariffFlow';
import { useConnectionState } from '../../hooks/useConnectionState';
import { useAuth } from '../../contexts/AuthContext';

const navigate = vi.fn();
const openSheet = vi.fn();

vi.mock('../../hooks/useSubscriptions', () => ({
    useSubscriptions: vi.fn(),
}));

vi.mock('../../hooks/useTariffFlow', () => ({
    useTariffFlow: vi.fn(),
}));

vi.mock('../../hooks/useConnectionState', () => ({
    useConnectionState: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../utils/telegram', async () => {
    const actual = await vi.importActual('../../utils/telegram');
    return { ...actual, openExternalLink: vi.fn() };
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

describe('HomeScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        navigate.mockReset();
        openSheet.mockReset();
        useAuth.mockReturnValue({ user: { first_name: 'Ivan', last_name: 'Petrov', username: 'ivanpetrov' } });
        useConnectionState.mockReturnValue({
            connectionState: 'active',
            progress: { hasSeenConfig: false, hasCopiedConfig: false, connectedLocally: false },
        });
        useTariffFlow.mockReturnValue({
            plans: [{ id: 0, durationDays: 30, price: 60, name: '1 месяц' }],
            selectedPlan: { id: 0, durationDays: 30, price: 60, name: '1 месяц' },
            selectedPlanId: 0,
            setSelectedPlanId: vi.fn(),
            isSubmitting: false,
            isSheetOpen: false,
            openSheet,
            closeSheet: vi.fn(),
            submitSelectedPlan: vi.fn(),
            starterPrice: 60,
            renewalPrice: 180,
            isRenewalFlow: false,
        });
    });

    test('active subscription routes primary CTA to config and shows details', () => {
        useSubscriptions.mockReturnValue({
            latestSubscription: subscriptionActive,
            isLoading: false,
            error: '',
        });

        render(<HomeScreen />);
        fireEvent.click(screen.getByRole('button', { name: /Получить конфиг и подключиться/i }));

        expect(navigate).toHaveBeenCalledWith('/config');
        expect(screen.getByText('🇩🇪 Германия (DE)')).toBeInTheDocument();
        expect(screen.getByText(/Следующий шаг всегда виден сразу/i)).toBeInTheDocument();
    });

    test('without subscription routes CTA to tariffs with starter price', () => {
        useSubscriptions.mockReturnValue({
            latestSubscription: null,
            isLoading: false,
            error: '',
        });
        useConnectionState.mockReturnValue({
            connectionState: 'none',
            progress: { hasSeenConfig: false, hasCopiedConfig: false, connectedLocally: false },
        });

        render(<HomeScreen />);
        fireEvent.click(screen.getByRole('button', { name: /Открыть доступ · от 60₽/i }));

        expect(openSheet).toHaveBeenCalled();
        expect(screen.getAllByText(/Подписки нет/i).length).toBeGreaterThan(0);
    });

    test('expiring subscription keeps config CTA and shows urgency copy', () => {
        useSubscriptions.mockReturnValue({
            latestSubscription: {
                ...subscriptionActive,
                expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            isLoading: false,
            error: '',
        });
        useConnectionState.mockReturnValue({
            connectionState: 'expiring',
            progress: { hasSeenConfig: false, hasCopiedConfig: false, connectedLocally: false },
        });

        render(<HomeScreen />);

        expect(screen.getByText(/Истекает скоро/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Получить конфиг и подключиться/i }));

        expect(navigate).toHaveBeenCalledWith('/config');
    });

    test('connected state hides setup block and keeps config recovery action', () => {
        useSubscriptions.mockReturnValue({
            latestSubscription: subscriptionActive,
            isLoading: false,
            error: '',
        });
        useConnectionState.mockReturnValue({
            connectionState: 'connected',
            progress: { hasSeenConfig: true, hasCopiedConfig: true, connectedLocally: true },
        });

        render(<HomeScreen />);

        expect(screen.getByText(/Доступ уже настроен/i)).toBeInTheDocument();
        expect(screen.queryByText(/Открой экран конфигурации/i)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Получить конфиг снова/i }));

        expect(navigate).toHaveBeenCalledWith('/config');
    });
});
