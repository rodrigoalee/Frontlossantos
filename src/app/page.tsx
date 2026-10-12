import Link from "next/link";
import Logo from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <Logo />
      <Link href="/login" className="btn btn-primary rounded-full px-10">
        Iniciar Sesión
      </Link>
    </div>
  );
}
