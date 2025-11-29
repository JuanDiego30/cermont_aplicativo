"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import apiClient from "@/core/api/client";

type PageMode = "request" | "reset";
type FormState = "idle" | "loading" | "success" | "error";

// ============================================================================
// REQUEST PASSWORD RESET FORM
// ============================================================================
function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setFormState("error");
      setMessage("Por favor ingresa tu correo electrónico");
      return;
    }

    setFormState("loading");
    setMessage("");

    try {
      const response = await apiClient.post<{ message?: string }>("/auth/forgot-password", { email });
      setFormState("success");
      setMessage(
        response.message ||
        "Si el correo existe, recibirás un enlace de recuperación."
      );
    } catch (error: unknown) {
      setFormState("error");
      const err = error as { response?: { data?: { detail?: string } } };
      setMessage(
        err.response?.data?.detail || "Ocurrió un error. Intenta nuevamente."
      );
    }
  };

  if (formState === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Revisa tu correo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            El enlace de recuperación expirará en 1 hora. Si no recibes el
            correo, revisa tu carpeta de spam.
          </p>
        </div>
        <Link href="/signin">
          <Button variant="outline" className="w-full">
            Volver al inicio de sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formState === "error" && message && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        </div>
      )}

      <div>
        <Label>
          Correo electrónico <span className="text-error-500">*</span>
        </Label>
        <Input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={formState === "loading"}
        />
      </div>

      <Button
        className="w-full"
        size="sm"
        disabled={formState === "loading"}
      >
        {formState === "loading"
          ? "Enviando..."
          : "Enviar enlace de recuperación"}
      </Button>

      <Link href="/signin">
        <Button variant="outline" className="w-full mt-3">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio de sesión
        </Button>
      </Link>
    </form>
  );
}

// ============================================================================
// RESET PASSWORD FORM
// ============================================================================
function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await apiClient.get<{ valid?: boolean; message?: string }>(
          `/auth/verify-reset-token?token=${token}`
        );
        setTokenValid(response.valid === true);
        if (!response.valid) {
          setMessage(response.message || "El enlace no es válido");
        }
      } catch {
        setTokenValid(false);
        setMessage("El enlace ha expirado o no es válido");
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setFormState("error");
      setMessage("Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setFormState("error");
      setMessage("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setFormState("error");
      setMessage("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setFormState("loading");
    setMessage("");

    try {
      const response = await apiClient.post<{ message?: string }>("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setFormState("success");
      setMessage(
        response.message || "Contraseña actualizada exitosamente"
      );
    } catch (error: unknown) {
      setFormState("error");
      const err = error as { response?: { data?: { detail?: string } } };
      setMessage(
        err.response?.data?.detail || "Ocurrió un error. Intenta nuevamente."
      );
    }
  };

  if (tokenValid === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        <p className="text-gray-600 dark:text-gray-400">Verificando enlace...</p>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Enlace no válido
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        <Link href="/forgot-password">
          <Button className="w-full">Solicitar nuevo enlace</Button>
        </Link>
      </div>
    );
  }

  if (formState === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          ¡Contraseña actualizada!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        <Link href="/signin">
          <Button className="w-full">Iniciar sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formState === "error" && message && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        </div>
      )}

      <div>
        <Label>
          Nueva contraseña <span className="text-error-500">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={formState === "loading"}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
          >
            {showPassword ? (
              <svg className="h-5 w-5 fill-gray-500 dark:fill-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 fill-gray-500 dark:fill-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
              </svg>
            )}
          </span>
        </div>
      </div>

      <div>
        <Label>
          Confirmar contraseña <span className="text-error-500">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={formState === "loading"}
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5 fill-gray-500 dark:fill-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 fill-gray-500 dark:fill-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
              </svg>
            )}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Requisitos de contraseña:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
          <li>Mínimo 8 caracteres</li>
          <li>Al menos una mayúscula</li>
          <li>Al menos un número</li>
        </ul>
      </div>

      <Button
        className="w-full"
        size="sm"
        disabled={formState === "loading"}
      >
        {formState === "loading" ? "Actualizando..." : "Actualizar contraseña"}
      </Button>
    </form>
  );
}

// ============================================================================
// INNER COMPONENT (uses useSearchParams)
// ============================================================================
function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const mode: PageMode = token ? "reset" : "request";

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio de sesión
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {mode === "reset" ? "Nueva Contraseña" : "Recuperar Contraseña"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {mode === "reset"
                ? "Ingresa tu nueva contraseña para restablecer el acceso"
                : "Ingresa tu correo para recibir un enlace de recuperación"}
            </p>
          </div>
          <div>
            {mode === "reset" ? (
              <ResetPasswordForm token={token!} />
            ) : (
              <RequestResetForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
