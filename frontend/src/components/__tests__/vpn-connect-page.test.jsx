import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DesktopVpnConnectPage from '../desktop/VpnConnectPage';
import { configListMultiple, configListSingle, subscriptionActive, subscriptionCanceled, subscriptionExpired } from '../../test/fixtures';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { fetchSubscriptionConfig } from '../../services/api';
import { openExternalLink } from '../../utils/telegram';

const navigate = vi.fn();

vi.mock('../../../TelegramUser', () => ({
    default: { getUser: () => ({ firstName: 'Ivan', lastName: 'Petrov', username: 'ivanpetrov', initials: 'IP', photoUrl: null }) },
}));

vi.mock('../../hooks/useSubscriptions', () => ({
    useSubscriptions: vi.fn(),
}));

vi.mock('../../services/api', () => ({
    fetchSubscriptionConfig: vi.fn(),
}));

vi.mock('../../utils/telegram', async () => {
    const actual = await vi.importActual('../../utils/telegram');
    return { ...actual, openExternalLink: vi.fn(), showAppAlert: vi.fn() };
});

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

describe('DesktopVpnConnectPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        navigate.mockReset();
    });

    test('shows tariffs CTA without subscriptions', () => {
        useSubscriptions.mockReturnValue({ subscriptions: [], activeSubscriptions: [], isLoading: false, error: '' });

        render(<DesktopVpnConnectPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Перейти к тарифам' }));

        expect(navigate).toHaveBeenCalledWith('/tariffs');
    });

    test('loads configs for selected active subscription', async () => {
        useSubscriptions.mockReturnValue({
            subscriptions: [subscriptionActive],
            activeSubscriptions: [subscriptionActive],
            isLoading: false,
            error: '',
        });
        fetchSubscriptionConfig.mockResolvedValue(configListSingle);

        render(<DesktopVpnConnectPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Получить конфигурацию' }));

        await waitFor(() => expect(fetchSubscriptionConfig).toHaveBeenCalledWith(subscriptionActive.id));
        expect(screen.getByText('https://sub.example.com/sub-1')).toBeInTheDocument();
        expect(screen.queryByText(/Пинг/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Скорость/i)).not.toBeInTheDocument();
    });

    test('allows switching between multiple subscriptions', async () => {
        useSubscriptions.mockReturnValue({
            subscriptions: [subscriptionExpired, subscriptionActive],
            activeSubscriptions: [subscriptionActive],
            isLoading: false,
            error: '',
        });
        fetchSubscriptionConfig.mockResolvedValue(configListMultiple);

        render(<DesktopVpnConnectPage />);
        expect(screen.getAllByText('30 дней').length).toBeGreaterThan(0);
        fireEvent.click(screen.getByRole('button', { name: 'Получить конфигурацию' }));

        await waitFor(() => expect(screen.getByText('vless://config-1')).toBeInTheDocument());
        expect(screen.getByText('trojan://config-2')).toBeInTheDocument();
    });

    test('renders honest error when config loading fails', async () => {
        useSubscriptions.mockReturnValue({
            subscriptions: [subscriptionActive],
            activeSubscriptions: [subscriptionActive],
            isLoading: false,
            error: '',
        });
        fetchSubscriptionConfig.mockRejectedValue({ response: { data: { detail: 'config failed' } } });

        render(<DesktopVpnConnectPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Получить конфигурацию' }));

        await waitFor(() => expect(screen.getByText('config failed')).toBeInTheDocument());
    });

    test('platform links open external link helper', () => {
        useSubscriptions.mockReturnValue({
            subscriptions: [subscriptionCanceled],
            activeSubscriptions: [],
            isLoading: false,
            error: '',
        });

        render(<DesktopVpnConnectPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Windows' }));

        expect(openExternalLink).toHaveBeenCalled();
    });
});
