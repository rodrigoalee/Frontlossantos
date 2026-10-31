import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import RegistroForm from "@/features/auth/components/RegistroForm";

export const metadata: Metadata = {
  title: "Crear cuenta | Los Santos Customs",
};

export default function RegistroPage() {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">
        <Logo />
        <RegistroForm />
      </div>
      <Footer />
    </>
  );
}
