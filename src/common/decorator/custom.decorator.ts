import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'match', async: true })
export class MatchConstraint<T> implements ValidatorConstraintInterface {
  validate(value: T, args: ValidationArguments): Promise<boolean> | boolean {
    const object = args.object;
    return value === object[args.constraints[0]];
  }
  defaultMessage(args?: ValidationArguments): string {
    return `${args?.property} must match ${args?.constraints[0]}`;
  }
}
export function Match(constraint: string[], validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: constraint,
      validator: MatchConstraint,
    });
  };
}
