import type { Metadata } from "next";
import Logo from "@/components/Logo";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Los Santos Customs",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">
      <Logo />
      <LoginForm />
    </div>
  );
}
