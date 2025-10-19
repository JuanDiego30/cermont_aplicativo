/**
 * Utilidad para combinar nombres de clases CSS de forma condicional
 * Filtra valores falsy y une las clases válidas con espacios
 * 
 * @example
 * cn('btn', isActive && 'active', 'primary') // "btn active primary"
 * cn('card', false, undefined, 'shadow') // "card shadow"
 */
export function cn(...args: Array<string | false | undefined | null>): string {
  return args.filter(Boolean).join(' ');
}
