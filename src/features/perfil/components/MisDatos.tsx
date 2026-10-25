import { FaPhone, FaRegEnvelope, FaRegUser } from "react-icons/fa6";
import { obtenerMiPerfil } from "../dal";

export default async function MisDatos() {
  const perfil = await obtenerMiPerfil();

  if (!perfil) {
    return <p className="text-sm text-base-content/60">Esta cuenta no pertenece a un cliente del taller.</p>;
  }

  const datos = [
    { Icono: FaRegUser, etiqueta: "Nombre", valor: perfil.nombreCompleto },
    { Icono: FaRegEnvelope, etiqueta: "Correo", valor: perfil.correo },
    { Icono: FaPhone, etiqueta: "Teléfono", valor: perfil.telefono },
  ];

  return (
    <ul className="flex flex-col gap-4">
      {datos.map(({ Icono, etiqueta, valor }) => (
        <li key={etiqueta} className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/15 text-secondary">
            <Icono aria-hidden className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-base-content/60">{etiqueta}</p>
            <p className="truncate">{valor}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
