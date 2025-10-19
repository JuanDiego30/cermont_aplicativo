import { useCallback, useState } from 'react';

/**
 * Hook personalizado para manejar estados booleanos
 * Proporciona métodos convenientes para toggle, set true/false
 * 
 * @param initial - Valor inicial del booleano (default: false)
 * @returns Objeto con el valor actual y métodos para manipularlo
 * 
 * @example
 * const modal = useBoolean();
 * modal.setTrue();  // Abre modal
 * modal.toggle();   // Alterna estado
 * modal.value       // true/false
 */
export function useBoolean(initial = false) {
  const [value, setValue] = useState<boolean>(initial);
  
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(v => !v), []);
  
  return { value, setTrue, setFalse, toggle, setValue };
}
