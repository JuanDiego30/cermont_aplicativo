import { FormField } from "../entities/form-field.entity";
import { FormTemplate } from "../entities/form-template.entity";
import { ConditionalLogicEvaluatorService } from "./conditional-logic-evaluator.service";

const conditionalLogicEvaluator = new ConditionalLogicEvaluatorService();

export function isFieldVisible(
  field: FormField,
  formData: Record<string, any>,
): boolean {
  const logic = field.getConditionalLogic();
  if (!logic) return true;

  return conditionalLogicEvaluator.evaluate(logic, formData);
}

export function isFieldIdVisible(
  fieldId: string,
  template: FormTemplate,
  formData: Record<string, any>,
): boolean {
  const field = template.getField(fieldId);
  if (!field) return true;

  return isFieldVisible(field, formData);
}
