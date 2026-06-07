// Comprime y redimensiona una imagen en el navegador antes de subirla.
// Reduce el lado mayor a `maxLado` px y la reexporta en WebP. Si algo falla
// (formato no soportado, etc.), devuelve el archivo original.
export async function comprimirImagen(
  file: File,
  maxLado = 1400,
  calidad = 0.82
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    const ladoMayor = Math.max(width, height);
    if (ladoMayor > maxLado) {
      const escala = maxLado / ladoMayor;
      width = Math.round(width * escala);
      height = Math.round(height * escala);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/webp", calidad)
    );
    if (!blob) return file;

    const nombre = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], nombre, { type: "image/webp" });
  } catch {
    return file;
  }
}
