import { EmailAddress } from '../email-address.vo';

describe('EmailAddress Value Object', () => {
    describe('create', () => {
        it('debe crear email válido', () => {
            const email = EmailAddress.create('test@example.com');
            expect(email.getValue()).toBe('test@example.com');
        });

        it('debe normalizar email a lowercase', () => {
            const email = EmailAddress.create('TEST@EXAMPLE.COM');
            expect(email.getValue()).toBe('test@example.com');
        });

        it('debe lanzar error con email vacío', () => {
            expect(() => EmailAddress.create('')).toThrow('Email no puede estar vacío');
        });

        it('debe lanzar error con email sin @', () => {
            expect(() => EmailAddress.create('invalidemail')).toThrow('Email inválido');
        });

        it('debe lanzar error con email sin dominio', () => {
            expect(() => EmailAddress.create('test@')).toThrow('Email inválido');
        });
    });

    describe('getDomain', () => {
        it('debe retornar dominio correcto', () => {
            const email = EmailAddress.create('test@example.com');
            expect(email.getDomain()).toBe('example.com');
        });
    });

    describe('getLocalPart', () => {
        it('debe retornar parte local correcta', () => {
            const email = EmailAddress.create('user@example.com');
            expect(email.getLocalPart()).toBe('user');
        });
    });

    describe('equals', () => {
        it('debe retornar true para emails iguales', () => {
            const email1 = EmailAddress.create('test@example.com');
            const email2 = EmailAddress.create('test@example.com');
            expect(email1.equals(email2)).toBe(true);
        });

        it('debe retornar true para emails con diferente case', () => {
            const email1 = EmailAddress.create('TEST@EXAMPLE.COM');
            const email2 = EmailAddress.create('test@example.com');
            expect(email1.equals(email2)).toBe(true);
        });

        it('debe retornar false para emails diferentes', () => {
            const email1 = EmailAddress.create('test1@example.com');
            const email2 = EmailAddress.create('test2@example.com');
            expect(email1.equals(email2)).toBe(false);
        });
    });
});
