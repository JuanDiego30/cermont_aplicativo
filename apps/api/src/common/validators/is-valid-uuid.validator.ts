import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidUUID', async: false })
export class IsValidUUIDConstraint implements ValidatorConstraintInterface {
    validate(value: any, _args: ValidationArguments) {
        if (!value) return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} debe ser un UUID válido`;
    }
}

export function IsValidUUID(validationOptions?: ValidationOptions) {
    return function (target: Object, propertyName: string) {
        registerDecorator({
            target: target.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidUUIDConstraint,
        });
    };
}
