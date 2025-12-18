import { Email } from '../email.entity';

describe('Email Entity', () => {
    describe('create', () => {
        it('debe crear email válido', () => {
            const email = Email.create(
                'from@example.com',
                ['to@example.com'],
                'Test Subject',
                'Test Body',
                '<p>Test HTML</p>',
            );

            expect(email.subject).toBe('Test Subject');
            expect(email.body).toBe('Test Body');
            expect(email.to).toHaveLength(1);
        });

        it('debe lanzar error con subject vacío', () => {
            expect(() =>
                Email.create(
                    'from@example.com',
                    ['to@example.com'],
                    '',
                    'Body',
                    '<p>HTML</p>',
                ),
            ).toThrow('Subject no puede estar vacío');
        });

        it('debe lanzar error sin body ni html', () => {
            expect(() =>
                Email.create(
                    'from@example.com',
                    ['to@example.com'],
                    'Subject',
                    '',
                    '',
                ),
            ).toThrow('Body o HTML debe estar presente');
        });

        it('debe validar email from inválido', () => {
            expect(() =>
                Email.create(
                    'invalid-email',
                    ['to@example.com'],
                    'Subject',
                    'Body',
                    '<p>HTML</p>',
                ),
            ).toThrow('Email inválido');
        });
    });

    describe('markAsSent', () => {
        it('debe marcar email como enviado', () => {
            const email = Email.create(
                'from@example.com',
                ['to@example.com'],
                'Subject',
                'Body',
                '<p>HTML</p>',
            );

            email.markAsSent();

            expect(email.wasSent).toBe(true);
            expect(email.hasFailed).toBe(false);
            expect(email.sentAt).toBeDefined();
        });
    });

    describe('markAsFailed', () => {
        it('debe marcar email como fallido', () => {
            const email = Email.create(
                'from@example.com',
                ['to@example.com'],
                'Subject',
                'Body',
                '<p>HTML</p>',
            );

            email.markAsFailed('Connection timeout');

            expect(email.wasSent).toBe(false);
            expect(email.hasFailed).toBe(true);
            expect(email.failedAt).toBeDefined();
            expect(email.error).toBe('Connection timeout');
        });
    });

    describe('toPersistence', () => {
        it('debe convertir a objeto de persistencia', () => {
            const email = Email.create(
                'from@example.com',
                ['to@example.com'],
                'Subject',
                'Body',
                '<p>HTML</p>',
            );

            const persistence = email.toPersistence();

            expect(persistence.from).toBe('from@example.com');
            expect(persistence.to).toEqual(['to@example.com']);
            expect(persistence.subject).toBe('Subject');
        });
    });
});
