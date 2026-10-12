import { FcGoogle } from "react-icons/fc";

// <a> normal (no <Link>): la ruta es un Route Handler que redirige a Google.
export default function GoogleButton() {
  return (
    <a href="/auth/google" className="btn w-full rounded-full border-base-300 bg-base-100 font-medium">
      <FcGoogle className="size-5" />
      Continuar con Google
    </a>
  );
}
