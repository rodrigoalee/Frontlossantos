import type { NextRequest } from "next/server";
import { ApiError, apiDescargar } from "@/lib/api";

const TIPOS = new Set(["ventas", "ordenes", "inventario", "citas"]);
const PARAMETROS = ["formato", "desde", "hasta", "sucursalId"] as const;

export async function GET(request: NextRequest) {
  const entrada = request.nextUrl.searchParams;
  const tipo = entrada.get("tipo") ?? "";
  if (!TIPOS.has(tipo)) return Response.json({ error: "Elige un reporte válido." }, { status: 400 });

  const consulta = new URLSearchParams();
  for (const nombre of PARAMETROS) {
    const valor = entrada.get(nombre);
    if (valor) consulta.set(nombre, valor);
  }

  try {
    const archivo = await apiDescargar(`/api/reportes/${tipo}?${consulta}`);
    return new Response(archivo.body, {
      headers: {
        "Content-Type": archivo.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": archivo.headers.get("content-disposition") ?? `attachment; filename="reporte-${tipo}"`,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const mensaje =
        error.status === 401
          ? "Tu sesión expiró. Vuelve a iniciar sesión."
          : error.status === 403
            ? "Tu cuenta no tiene permiso para descargar reportes."
            : (error.detalle ?? "Revisa los filtros e intenta de nuevo.");
      return Response.json({ error: mensaje }, { status: error.status });
    }
    console.error("Error al generar el reporte:", error);
    return Response.json({ error: "No se pudo generar el reporte. Intenta más tarde." }, { status: 502 });
  }
}
