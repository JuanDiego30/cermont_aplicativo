import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';

export type EmailTemplateName =
  | 'welcome'
  | 'password-reset'
  | 'order-assigned'
  | 'order-completed';

export interface TemplateRenderResult {
  html: string;
  text: string;
}

function resolveTemplatePath(fileName: string): string {
  const candidates = [
    path.join(process.cwd(), 'dist', 'templates', 'emails', fileName),
    path.join(process.cwd(), 'src', 'templates', 'emails', fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return candidates[0];
}

const compiledCache = new Map<string, Handlebars.TemplateDelegate>();

function compileHbsFromDisk(fileName: string): Handlebars.TemplateDelegate {
  const absolutePath = resolveTemplatePath(fileName);

  const cached = compiledCache.get(absolutePath);
  if (cached) return cached;

  const source = fs.readFileSync(absolutePath, 'utf-8');
  const tpl = Handlebars.compile(source);
  compiledCache.set(absolutePath, tpl);
  return tpl;
}

function stripHtml(html: string): string {
  // Minimalista: para texto plano usa una eliminación básica de tags.
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function renderEmailTemplate(
  name: EmailTemplateName,
  data: Record<string, unknown>,
): TemplateRenderResult {
  const fileName =
    name === 'welcome'
      ? 'welcome.template.hbs'
      : name === 'password-reset'
        ? 'password-reset.template.hbs'
        : name === 'order-assigned'
          ? 'order-assigned.template.hbs'
          : 'order-completed.template.hbs';

  const tpl = compileHbsFromDisk(fileName);
  const html = tpl(data);
  return {
    html,
    text: stripHtml(html),
  };
}
