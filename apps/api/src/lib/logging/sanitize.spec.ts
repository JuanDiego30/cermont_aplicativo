import { sanitizeLogMeta, sanitizeUrl } from './sanitize';

describe('logging sanitization', () => {
    it('masks sensitive keys in objects', () => {
        const input = {
            password: 'super-secret',
            token: 'abc.def.ghi',
            nested: {
                authorization: 'Bearer abc.def.ghi',
                ok: 'value',
            },
        };

        const out = sanitizeLogMeta(input);
        expect(out.password).toContain('***');
        expect(out.token).toBe('[REDACTED_JWT]');
        expect(out.nested.authorization).toContain('***');
        expect(out.nested.ok).toBe('value');
    });

    it('redacts sensitive query params in urls', () => {
        const url = '/api/auth/login?token=abc.def.ghi&keep=1&password=super-secret';
        const out = sanitizeUrl(url);
        expect(out).toContain('token=%5BREDACTED%5D');
        expect(out).toContain('password=%5BREDACTED%5D');
        expect(out).toContain('keep=1');
    });
});
