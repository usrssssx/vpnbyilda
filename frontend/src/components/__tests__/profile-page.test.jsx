import { fireEvent, render, screen } from '@testing-library/react';
import DesktopProfilePage from '../desktop/ProfilePage';
import { subscriptionActive } from '../../test/fixtures';
import { useSubscriptions } from '../../hooks/useSubscriptions';

const navigate = vi.fn();

vi.mock('../../../TelegramUser', () => ({
    default: { getUser: () => ({ firstName: 'Ivan', lastName: 'Petrov', username: 'ivanpetrov', initials: 'IP', photoUrl: null }) },
}));

vi.mock('../../hooks/useSubscriptions', () => ({
    useSubscriptions: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
}));

describe('DesktopProfilePage', () => {
    beforeEach(() => {
        navigate.mockReset();
    });

    test('active subscription routes primary CTA to vpn', () => {
        useSubscriptions.mockReturnValue({ latestSubscription: subscriptionActive });

        render(<DesktopProfilePage />);
        fireEvent.click(screen.getAllByRole('button', { name: 'Подключить VPN' })[0]);

        expect(navigate).toHaveBeenCalledWith('/vpn');
        expect(screen.getByText('🇩🇪 Германия (DE)')).toBeInTheDocument();
    });

    test('no active subscription routes CTA to tariffs', () => {
        useSubscriptions.mockReturnValue({ latestSubscription: null });

        render(<DesktopProfilePage />);
        fireEvent.click(screen.getAllByRole('button', { name: 'Оформить подписку' })[0]);

        expect(navigate).toHaveBeenCalledWith('/tariffs');
        expect(screen.queryByText(/06\/27/)).not.toBeInTheDocument();
    });
});
