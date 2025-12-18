import { OrdenNumero } from '../orden-numero.vo';

describe('OrdenNumero Value Object', () => {
    describe('create', () => {
        it('debe crear OrdenNumero con secuencia 1', () => {
            const numero = OrdenNumero.create(1);
            expect(numero.value).toBe('ORD-000001');
        });

        it('debe crear OrdenNumero con secuencia 123456', () => {
            const numero = OrdenNumero.create(123456);
            expect(numero.value).toBe('ORD-123456');
        });

        it('debe ser inmutable (Object.freeze)', () => {
            const numero = OrdenNumero.create(1);
            expect(Object.isFrozen(numero)).toBe(true);
        });
    });

    describe('fromString', () => {
        it('debe crear OrdenNumero desde string válido', () => {
            const numero = OrdenNumero.fromString('ORD-123456');
            expect(numero).not.toBeNull();
            expect(numero!.value).toBe('ORD-123456');
        });

        it('debe retornar null con formato inválido', () => {
            expect(OrdenNumero.fromString('INVALID')).toBeNull();
            expect(OrdenNumero.fromString('ORD-12345')).toBeNull(); // 5 dígitos
            expect(OrdenNumero.fromString('ORD-1234567')).toBeNull(); // 7 dígitos
            expect(OrdenNumero.fromString('ORDER-123456')).toBeNull();
        });
    });

    describe('isValid', () => {
        it('debe validar formato correcto', () => {
            expect(OrdenNumero.isValid('ORD-123456')).toBe(true);
            expect(OrdenNumero.isValid('ORD-000001')).toBe(true);
        });

        it('debe rechazar formato incorrecto', () => {
            expect(OrdenNumero.isValid('invalid')).toBe(false);
            expect(OrdenNumero.isValid('ORD-12345')).toBe(false);
            expect(OrdenNumero.isValid('')).toBe(false);
        });
    });

    describe('getSequence', () => {
        it('debe extraer secuencia numérica', () => {
            const numero = OrdenNumero.create(42);
            expect(numero.getSequence()).toBe(42);
        });
    });

    describe('equals', () => {
        it('debe comparar dos OrdenNumero iguales', () => {
            const n1 = OrdenNumero.create(100);
            const n2 = OrdenNumero.create(100);
            expect(n1.equals(n2)).toBe(true);
        });

        it('debe comparar dos OrdenNumero diferentes', () => {
            const n1 = OrdenNumero.create(100);
            const n2 = OrdenNumero.create(200);
            expect(n1.equals(n2)).toBe(false);
        });
    });

    describe('toString', () => {
        it('debe retornar string representation', () => {
            const numero = OrdenNumero.create(999);
            expect(numero.toString()).toBe('ORD-000999');
        });
    });
});
