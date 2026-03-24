import { confirmAppAction, openExternalLink } from '../telegram';

describe('telegram utils', () => {
    afterEach(() => {
        window.Telegram = undefined;
        vi.restoreAllMocks();
    });

    test('openExternalLink uses Telegram WebApp openLink when available', () => {
        const openLink = vi.fn();
        window.Telegram = { WebApp: { openLink } };

        openExternalLink('https://example.com');

        expect(openLink).toHaveBeenCalledWith('https://example.com');
    });

    test('openExternalLink falls back to window.open', () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);

        openExternalLink('https://example.com');

        expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });

    test('confirmAppAction uses Telegram confirm when available', async () => {
        window.Telegram = {
            WebApp: {
                showConfirm: (message, callback) => callback(true),
            },
        };

        await expect(confirmAppAction('Confirm?')).resolves.toBe(true);
    });

    test('confirmAppAction falls back to window.confirm', async () => {
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

        await expect(confirmAppAction('Confirm?')).resolves.toBe(false);
        expect(confirm).toHaveBeenCalledWith('Confirm?');
    });
});
