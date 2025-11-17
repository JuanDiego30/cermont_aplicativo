'use client';
import { useAuthContext } from '../auth/AuthContext';
import { useEffect, useState } from 'react';

// Wrapper para añadir isInitialized similar a la guía
export function useAuth() {
	const ctx = useAuthContext();
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Cuando el contexto termina de cargar (isLoading false) marcamos inicializado
		if (!ctx.isLoading && !isInitialized) {
			setIsInitialized(true);
		}
	}, [ctx.isLoading, isInitialized]);

	return {
		user: ctx.user,
		isAuthenticated: ctx.isAuthenticated,
		login: ctx.login,
		logout: ctx.logout,
		isLoading: ctx.isLoading,
		isInitialized,
	};
}

