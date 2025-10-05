export function adjustColors(
  canvas: HTMLCanvasElement,
  red: number,
  green: number,
  blue: number,
  gamma: number
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Create gamma lookup table
  const gammaCorrection = new Array(256);
  for (let i = 0; i < 256; i++) {
    gammaCorrection[i] = Math.pow(i / 255, 1 / gamma) * 255;
  }

  for (let i = 0; i < data.length; i += 4) {
    // Apply RGB adjustments
    data[i] = Math.max(0, Math.min(255, data[i] + red));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + green));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + blue));

    // Apply gamma correction
    data[i] = gammaCorrection[data[i]];
    data[i + 1] = gammaCorrection[data[i + 1]];
    data[i + 2] = gammaCorrection[data[i + 2]];
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
