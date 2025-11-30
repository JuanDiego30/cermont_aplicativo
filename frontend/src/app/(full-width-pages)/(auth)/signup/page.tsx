import { SignUpForm } from "@/features/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro | Cermont",
  description: "Crear cuenta en Cermont Sistema de Gestión",
};

export default function SignUp() {
  return <SignUpForm />;
}
