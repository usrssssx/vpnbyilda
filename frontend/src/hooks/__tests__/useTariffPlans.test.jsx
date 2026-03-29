import { act, renderHook, waitFor } from '@testing-library/react';
import { useTariffPlans } from '../useTariffPlans';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
    createSubscription: vi.fn(),
    getSubscriptionPrice: vi.fn(),
}));

vi.mock('../../utils/telegram', async () => {
    const actual = await vi.importActual('../../utils/telegram');
    return {
        ...actual,
        showAppAlert: vi.fn(),
    };
});

describe('useTariffPlans', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.getSubscriptionPrice.mockResolvedValue({ price: 60 });
    });

    test('navigates straight to config when backend returns internal URL', async () => {
        const navigate = vi.fn();
        api.createSubscription.mockResolvedValue({ url: '/subscriptions/sub-active' });

        const { result } = renderHook(() => useTariffPlans(navigate));

        await waitFor(() => expect(result.current.plans[0].price).toBe(60));

        await act(async () => {
            await result.current.buyPlan(result.current.plans[0]);
        });

        expect(navigate).toHaveBeenCalledWith('/config');
    });
});
