/**
 * Helper utility to read and optimize user-uploaded image files.
 * Downscales images exceeding standard web dimensions and compresses to JPEG/PNG data URLs.
 * This guarantees fast rendering and prevents localStorage quota exhaustion.
 */
export function readFileAsOptimizedDataUrl(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('O arquivo selecionado não é uma imagem válida.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo selecionado.'));

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error('Falha ao obter conteúdo da imagem.'));
      }

      // If SVG or very small image (< 100KB), return as-is
      if (file.type === 'image/svg+xml' || file.size < 100 * 1024) {
        return resolve(rawDataUrl);
      }

      const img = new Image();
      img.onerror = () => resolve(rawDataUrl); // Fallback to raw data url if canvas fails
      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return resolve(rawDataUrl);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Preserve PNG transparency if PNG file, otherwise JPEG
          const isTransparent = file.type === 'image/png' || file.type === 'image/webp';
          const format = isTransparent && file.size < 600 * 1024 ? 'image/png' : 'image/jpeg';
          const optimized = canvas.toDataURL(format, quality);
          resolve(optimized);
        } catch {
          resolve(rawDataUrl);
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
