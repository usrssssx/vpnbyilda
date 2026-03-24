import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DesktopSubscriptionPage from '../desktop/SubscriptionPage';
import { subscriptionActive, subscriptionCanceled } from '../../test/fixtures';
import { useSubscriptionDetails, useSubscriptions } from '../../hooks/useSubscriptions';
import { cancelSubscription } from '../../services/api';
import { confirmAppAction, showAppAlert } from '../../utils/telegram';

const navigate = vi.fn();

vi.mock('../../../TelegramUser', () => ({
    default: { getUser: () => ({ firstName: 'Ivan', lastName: 'Petrov', username: 'ivanpetrov', initials: 'IP', photoUrl: null }) },
}));

vi.mock('../../hooks/useSubscriptions', () => ({
    useSubscriptionDetails: vi.fn(),
    useSubscriptions: vi.fn(),
}));

vi.mock('../../services/api', () => ({
    cancelSubscription: vi.fn(),
}));

vi.mock('../../utils/telegram', async () => {
    const actual = await vi.importActual('../../utils/telegram');
    return {
        ...actual,
        confirmAppAction: vi.fn(),
        showAppAlert: vi.fn(),
    };
});

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
    useParams: () => ({ subscriptionId: 'sub-active' }),
}));

describe('DesktopSubscriptionPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        navigate.mockReset();
    });

    test('shows only real subscription fields', () => {
        useSubscriptionDetails.mockReturnValue({
            subscription: subscriptionActive,
            price: 199,
            isLoading: false,
            error: '',
            reload: vi.fn(),
        });
        useSubscriptions.mockReturnValue({ reloadSubscriptions: vi.fn() });

        render(<DesktopSubscriptionPage />);

        expect(screen.getAllByText('🇩🇪 Германия (DE)')).toHaveLength(2);
        expect(screen.getByText('VLESS')).toBeInTheDocument();
        expect(screen.queryByText(/06\/27/)).not.toBeInTheDocument();
        expect(screen.queryByText(/История платежей/i)).not.toBeInTheDocument();
    });

    test('cancel flow confirms, calls API and reloads', async () => {
        const reload = vi.fn().mockResolvedValue(undefined);
        const reloadSubscriptions = vi.fn().mockResolvedValue(undefined);
        useSubscriptionDetails.mockReturnValue({
            subscription: subscriptionActive,
            price: 199,
            isLoading: false,
            error: '',
            reload,
        });
        useSubscriptions.mockReturnValue({ reloadSubscriptions });
        confirmAppAction.mockResolvedValue(true);
        cancelSubscription.mockResolvedValue(subscriptionCanceled);

        render(<DesktopSubscriptionPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Отменить подписку' }));

        await waitFor(() => expect(cancelSubscription).toHaveBeenCalledWith(subscriptionActive.id));
        expect(reload).toHaveBeenCalled();
        expect(reloadSubscriptions).toHaveBeenCalled();
    });

    test('cancel disabled for inactive subscription', () => {
        useSubscriptionDetails.mockReturnValue({
            subscription: subscriptionCanceled,
            price: 199,
            isLoading: false,
            error: '',
            reload: vi.fn(),
        });
        useSubscriptions.mockReturnValue({ reloadSubscriptions: vi.fn() });

        render(<DesktopSubscriptionPage />);

        expect(screen.getByRole('button', { name: 'Отменить подписку' })).toBeDisabled();
    });

    test('cancel error shows alert', async () => {
        useSubscriptionDetails.mockReturnValue({
            subscription: subscriptionActive,
            price: 199,
            isLoading: false,
            error: '',
            reload: vi.fn(),
        });
        useSubscriptions.mockReturnValue({ reloadSubscriptions: vi.fn() });
        confirmAppAction.mockResolvedValue(true);
        cancelSubscription.mockRejectedValue({ response: { data: { detail: 'cancel failed' } } });

        render(<DesktopSubscriptionPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Отменить подписку' }));

        await waitFor(() => expect(showAppAlert).toHaveBeenCalledWith('cancel failed'));
    });
});
