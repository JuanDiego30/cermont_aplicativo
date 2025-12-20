import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { formsApi, type CreateFormTemplateDto, type UpdateFormTemplateDto, type SubmitFormDto, type UpdateFormInstanceDto } from '../api/forms-api';

// Keys para cache de SWR
const KEYS = {
  TEMPLATES: '/forms/templates',
  INSTANCES: '/forms/instances',
};

export function useFormTemplates(filters?: { tipo?: string; categoria?: string; activo?: boolean }) {
  // Serializamos los filtros para crear una key única
  const key = [KEYS.TEMPLATES, JSON.stringify(filters)];
  return useSWR(
    key,
    () => formsApi.findAllTemplates(filters),
    {
      dedupingInterval: 2 * 60 * 1000, // 2 minutos
    }
  );
}

export function useFormTemplate(id: string) {
  return useSWR(
    id ? `${KEYS.TEMPLATES}/${id}` : null,
    () => formsApi.findTemplateById(id),
    {
      dedupingInterval: 5 * 60 * 1000, // 5 minutos
    }
  );
}

export function useCreateFormTemplate() {
  return useSWRMutation(
    KEYS.TEMPLATES,
    async (_, { arg: dto }: { arg: CreateFormTemplateDto }) => {
      return formsApi.createTemplate(dto);
    }
  );
}

export function useUpdateFormTemplate() {
  return useSWRMutation(
    KEYS.TEMPLATES,
    async (_, { arg }: { arg: { id: string; dto: UpdateFormTemplateDto } }) => {
      return formsApi.updateTemplate(arg.id, arg.dto);
    }
  );
}

export function useDeleteFormTemplate() {
  return useSWRMutation(
    KEYS.TEMPLATES,
    async (_, { arg: id }: { arg: string }) => {
      return formsApi.deleteTemplate(id);
    }
  );
}

export function useParseAndCreateTemplate() {
  return useSWRMutation(
    KEYS.TEMPLATES,
    async (_, { arg: file }: { arg: File }) => {
      return formsApi.parseAndCreateTemplate(file);
    }
  );
}

export function useFormInstances(filters?: { templateId?: string; ordenId?: string; estado?: string }) {
  const key = [KEYS.INSTANCES, JSON.stringify(filters)];
  return useSWR(
    key,
    () => formsApi.findAllInstances(filters),
    {
      dedupingInterval: 1 * 60 * 1000, // 1 minuto
    }
  );
}

export function useFormInstance(id: string) {
  return useSWR(
    id ? `${KEYS.INSTANCES}/${id}` : null,
    () => formsApi.findInstanceById(id),
    {
      dedupingInterval: 2 * 60 * 1000, // 2 minutos
    }
  );
}

export function useSubmitForm() {
  return useSWRMutation(
    KEYS.INSTANCES,
    async (_, { arg: dto }: { arg: SubmitFormDto }) => {
      return formsApi.submitForm(dto);
    }
  );
}

export function useUpdateFormInstance() {
  return useSWRMutation(
    KEYS.INSTANCES,
    async (_, { arg }: { arg: { id: string; dto: UpdateFormInstanceDto } }) => {
      return formsApi.updateInstance(arg.id, arg.dto);
    }
  );
}

export function useDeleteFormInstance() {
  return useSWRMutation(
    KEYS.INSTANCES,
    async (_, { arg: id }: { arg: string }) => {
      return formsApi.deleteInstance(id);
    }
  );
}
