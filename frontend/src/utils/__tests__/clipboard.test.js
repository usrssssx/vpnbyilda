import { copyText } from '../clipboard';

describe('clipboard util', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('uses navigator.clipboard when available', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });

        await copyText('hello');

        expect(writeText).toHaveBeenCalledWith('hello');
    });

    test('falls back to execCommand', async () => {
        Object.assign(navigator, { clipboard: undefined });
        const execCommand = vi.spyOn(document, 'execCommand').mockReturnValue(true);

        await copyText('fallback');

        expect(execCommand).toHaveBeenCalledWith('copy');
    });
});
