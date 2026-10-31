/** Tope de las server actions (1 MB) menos un margen para el resto del formulario. */
export const TAMANO_MAXIMO_FOTO = 950_000;

/**
 * Reduce una foto del celular (4–8 MB) a un JPEG de ~300 KB antes de subirla. Si con la primera
 * pasada sigue pasando del tope, prueba más pequeña y con menos calidad.
 */
export async function comprimirFoto(archivo: File): Promise<File> {
  const imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  try {
    for (const [lado, calidad] of [
      [1600, 0.8],
      [1280, 0.7],
      [1024, 0.6],
    ] as const) {
      const escala = Math.min(1, lado / Math.max(imagen.width, imagen.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);
      lienzo.getContext("2d")!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

      const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/jpeg", calidad));
      if (blob && blob.size <= TAMANO_MAXIMO_FOTO) return new File([blob], "foto.jpg", { type: "image/jpeg" });
    }
  } finally {
    imagen.close();
  }
  throw new Error("La foto es demasiado grande incluso después de reducirla.");
}
