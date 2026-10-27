import Link from "next/link";
import { redirect } from "next/navigation";
import { FaMagnifyingGlass, FaScrewdriverWrench } from "react-icons/fa6";
import Paginador from "@/components/Paginador";
import type { ResultadoPaginado } from "@/features/clientes/types";
import { ApiError } from "@/lib/api";
import { contarMisOrdenes, obtenerMisOrdenes, TAMANIO_PAGINA_MIS_ORDENES } from "../dal";
import type { FiltroMisOrdenes as Filtro } from "../filtros";
import type { ConteoOrdenesPorEstado, EstadoOrden, OrdenLista } from "../types";
import BotonEstadoOrden from "./BotonEstadoOrden";
import FiltroMisOrdenes from "./FiltroMisOrdenes";
import OrdenCard from "./OrdenCard";

const LISTA_VACIA: Record<EstadoOrden, { titulo: string; detalle: string }> = {
  EnRecepcion: {
    titulo: "No tienes carros por empezar",
    detalle: "Cuando recepción te asigne un carro, aparecerá aquí.",
  },
  EnProceso: {
    titulo: "No tienes trabajos en proceso",
    detalle: "Empieza una orden desde la pestaña En recepción.",
  },
  Finalizado: {
    titulo: "Aún no has finalizado órdenes",
    detalle: "Las órdenes que termines quedarán aquí como historial.",
  },
};

function hrefMisOrdenes(estado: string, busqueda: string, pagina = 1) {
  const parametros = new URLSearchParams({ estado });
  if (busqueda) parametros.set("q", busqueda);
  if (pagina > 1) parametros.set("pagina", String(pagina));
  return `/admin/ordenes?${parametros}`;
}

function ListaVacia({ titulo, detalle, children }: { titulo: string; detalle: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-base-300 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-secondary">
        <FaScrewdriverWrench aria-hidden className="size-5" />
      </span>
      <div>
        <p className="font-semibold break-words text-secondary">{titulo}</p>
        <p className="text-sm text-base-content/60">{detalle}</p>
      </div>
      {children}
    </div>
  );
}

export default async function MisOrdenes({
  filtro,
  busqueda,
  pagina,
}: {
  filtro: Filtro;
  busqueda: string;
  pagina: number;
}) {
  let resultado: ResultadoPaginado<OrdenLista>;
  let conteos: ConteoOrdenesPorEstado;
  try {
    [resultado, conteos] = await Promise.all([
      obtenerMisOrdenes(filtro.estado, busqueda, pagina),
      contarMisOrdenes(busqueda),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }

  const totalPaginas = Math.ceil(resultado.total / TAMANIO_PAGINA_MIS_ORDENES);
  const vacia = LISTA_VACIA[filtro.estado];

  return (
    <div className="flex flex-col gap-6">
      <FiltroMisOrdenes actual={filtro.valor} conteos={conteos} busqueda={busqueda} />

      <form action="/admin/ordenes" role="search" className="flex gap-2">
        <input type="hidden" name="estado" value={filtro.valor} />
        <label className="input min-h-11 grow rounded-full">
          <FaMagnifyingGlass aria-hidden className="size-3.5 opacity-50" />
          <input
            type="search"
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por placa o cliente"
            aria-label="Buscar por placa o cliente"
            maxLength={100}
          />
        </label>
        <button type="submit" className="btn min-h-11 rounded-full px-5">
          Buscar
        </button>
      </form>

      {resultado.items.length === 0 ? (
        busqueda ? (
          <ListaVacia titulo={`Ninguna orden coincide con “${busqueda}”`} detalle="Prueba con otra placa o nombre.">
            <Link href={hrefMisOrdenes(filtro.valor, "")} className="btn btn-sm rounded-full px-5">
              Quitar búsqueda
            </Link>
          </ListaVacia>
        ) : resultado.total > 0 ? (
          <ListaVacia titulo="Esta página ya no tiene órdenes" detalle="Vuelve a la primera página.">
            <Link href={hrefMisOrdenes(filtro.valor, "")} className="btn btn-sm rounded-full px-5">
              Ir a la primera página
            </Link>
          </ListaVacia>
        ) : (
          <ListaVacia titulo={vacia.titulo} detalle={vacia.detalle} />
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {resultado.items.map((orden) => (
            <li key={orden.idOrdenEncabezado} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <OrdenCard orden={orden} conMecanico={false} />
              {orden.estado === "EnRecepcion" && (
                <BotonEstadoOrden idOrden={orden.idOrdenEncabezado} estado={orden.estado} />
              )}
            </li>
          ))}
        </ul>
      )}

      <Paginador
        pagina={pagina}
        totalPaginas={totalPaginas}
        hrefPagina={(numero) => hrefMisOrdenes(filtro.valor, busqueda, numero)}
      />
    </div>
  );
}
