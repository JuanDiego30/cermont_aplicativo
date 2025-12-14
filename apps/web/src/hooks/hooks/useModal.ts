/**
 * ARCHIVO: useModal.ts
 * FUNCION: Hook para controlar estado de modales/dialogs
 * IMPLEMENTACION: Gestiona estado booleano isOpen con funciones memoizadas open/close/toggle
 * DEPENDENCIAS: React hooks (useState, useCallback)
 * EXPORTS: useModal
 */
'use client';
import { useState, useCallback } from 'react';
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);
  return { isOpen, openModal, closeModal, toggleModal };
}
export default useModal;
