import { SignInForm } from "@/features/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Cermont",
  description: "Inicia sesión en el sistema de gestión Cermont",
};

export default function SignIn() {
  return <SignInForm />;
}
