import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ConfigScreen from '../app/ConfigScreen';
import { configListMultiple, subscriptionActive, subscriptionExpired } from '../../test/fixtures';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { fetchSubscriptionConfig } from '../../services/api';
import { openExternalLink, showAppAlert } from '../../utils/telegram';
import { copyText } from '../../utils/clipboard';

const navigate = vi.fn();

vi.mock('../../hooks/useSubscriptions', () => ({
    useSubscriptions: vi.fn(),
}));

vi.mock('../../services/api', () => ({
    fetchSubscriptionConfig: vi.fn(),
}));

vi.mock('../../utils/clipboard', () => ({
    copyText: vi.fn(),
}));

vi.mock('../../utils/telegram', async () => {
    const actual = await vi.importActual('../../utils/telegram');
    return {
        ...actual,
        openExternalLink: vi.fn(),
        showAppAlert: vi.fn(),
    };
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

describe('ConfigScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        navigate.mockReset();
    });

    test('without active subscription routes user to tariffs', () => {
        useSubscriptions.mockReturnValue({
            activeSubscriptions: [],
            latestSubscription: subscriptionExpired,
            isLoading: false,
            error: '',
        });

        render(<ConfigScreen />);
        fireEvent.click(screen.getByRole('button', { name: /Перейти к тарифам/i }));

        expect(navigate).toHaveBeenCalledWith('/tariffs');
    });

    test('loads config automatically and copies primary config', async () => {
        useSubscriptions.mockReturnValue({
            activeSubscriptions: [subscriptionActive],
            latestSubscription: subscriptionActive,
            isLoading: false,
            error: '',
        });
        fetchSubscriptionConfig.mockResolvedValue(configListMultiple);
        copyText.mockResolvedValue();

        render(<ConfigScreen />);

        await waitFor(() => expect(fetchSubscriptionConfig).toHaveBeenCalledWith(subscriptionActive.id));
        expect(screen.getByText('vless://config-1')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Скопировать конфиг/i }));

        await waitFor(() => expect(copyText).toHaveBeenCalledWith('vless://config-1'));
        expect(showAppAlert).toHaveBeenCalledWith('Конфиг скопирован.');
    });

    test('platform links use external opener', async () => {
        useSubscriptions.mockReturnValue({
            activeSubscriptions: [subscriptionActive],
            latestSubscription: subscriptionActive,
            isLoading: false,
            error: '',
        });
        fetchSubscriptionConfig.mockResolvedValue(configListMultiple);

        render(<ConfigScreen />);

        await waitFor(() => expect(screen.getByRole('button', { name: 'Windows' })).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: 'Windows' }));

        expect(openExternalLink).toHaveBeenCalled();
    });
});
