// Public API for TailAdmin-based UI kit.
//
// Nota: en esta primera iteración, re-exportamos componentes existentes ubicados
// en shared/components/** para NO perder UI/UX ni romper imports.
// En PRs posteriores, estos componentes pueden moverse físicamente a
// shared/ui/tailadmin/components/** y dejar wrappers de compatibilidad.

export * from '../../components';
