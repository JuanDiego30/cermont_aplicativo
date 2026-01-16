import { FormSubmission } from './form-submission.entity';
import { FormTemplate } from './form-template.entity';
import { FormField } from './form-field.entity';
import { FieldType } from '../value-objects/field-type.vo';
import { CalculationFormula } from '../value-objects/calculation-formula.vo';
import { ValidationFailedException } from '../exceptions/validation-failed.exception';

function createPublishedTemplate(fields: FormField[]): FormTemplate {
  const template = FormTemplate.create({
    name: 'Test Template',
    description: 'Template for tests',
    contextType: 'orden',
    createdBy: 'user-1',
    fields,
  });

  template.publish();
  return template;
}

describe('FormSubmission.submit', () => {
  it('no exige un campo requerido si está oculto por lógica condicional', () => {
    const template = createPublishedTemplate([
      FormField.create({
        id: 'trigger',
        type: FieldType.text(),
        label: 'Trigger',
        isRequired: true,
      }),
      FormField.create({
        id: 'details',
        type: FieldType.text(),
        label: 'Details',
        isRequired: true,
        conditionalLogic: {
          targetFieldId: 'trigger',
          operator: 'EQUALS',
          expectedValue: 'yes',
          action: 'SHOW',
        },
      }),
    ]);

    const submission = FormSubmission.create({
      templateId: template.getId(),
      templateVersion: template.getVersion(),
      contextType: 'orden',
      contextId: 'orden-1',
      submittedBy: 'user-1',
    });

    submission.setAnswer('trigger', 'no');

    expect(() => submission.submit(template)).not.toThrow();
  });

  it('falla si un campo requerido está visible y no se responde', () => {
    const template = createPublishedTemplate([
      FormField.create({
        id: 'trigger',
        type: FieldType.text(),
        label: 'Trigger',
        isRequired: true,
      }),
      FormField.create({
        id: 'details',
        type: FieldType.text(),
        label: 'Details',
        isRequired: true,
        conditionalLogic: {
          targetFieldId: 'trigger',
          operator: 'EQUALS',
          expectedValue: 'yes',
          action: 'SHOW',
        },
      }),
    ]);

    const submission = FormSubmission.create({
      templateId: template.getId(),
      templateVersion: template.getVersion(),
      contextType: 'orden',
      contextId: 'orden-1',
      submittedBy: 'user-1',
    });

    submission.setAnswer('trigger', 'yes');

    expect(() => submission.submit(template)).toThrow(ValidationFailedException);
  });

  it('aplica defaultValue para campos omitidos', () => {
    const template = createPublishedTemplate([
      FormField.create({
        id: 'score',
        type: FieldType.number(),
        label: 'Score',
        isRequired: true,
        defaultValue: 10,
      }),
    ]);

    const submission = FormSubmission.create({
      templateId: template.getId(),
      templateVersion: template.getVersion(),
      contextType: 'orden',
      contextId: 'orden-1',
      submittedBy: 'user-1',
    });

    expect(() => submission.submit(template)).not.toThrow();
    expect(submission.getAnswer('score')?.getValue()).toBe(10);
  });

  it('calcula campos calculados cuando dependencias están completas', () => {
    const template = createPublishedTemplate([
      FormField.create({
        id: 'a',
        type: FieldType.number(),
        label: 'A',
        isRequired: true,
      }),
      FormField.create({
        id: 'b',
        type: FieldType.number(),
        label: 'B',
        isRequired: true,
      }),
      FormField.create({
        id: 'sum',
        type: FieldType.calculated(),
        label: 'Sum',
        calculationFormula: CalculationFormula.create('a + b'),
      }),
    ]);

    const submission = FormSubmission.create({
      templateId: template.getId(),
      templateVersion: template.getVersion(),
      contextType: 'orden',
      contextId: 'orden-1',
      submittedBy: 'user-1',
    });

    submission.setAnswer('a', 2);
    submission.setAnswer('b', 3);

    submission.submit(template);

    expect(submission.getAnswer('sum')?.getValue()).toBe(5);
  });
});
