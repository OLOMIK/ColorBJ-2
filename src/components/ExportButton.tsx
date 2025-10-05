// components/ExportButton.tsx
import { useState } from "react";

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  defaultName?: string;
};

export function ExportButton({ canvasRef, defaultName = "image" }: Props) {
  const [format, setFormat] = useState<"png" | "jpg" | "webp">("png");

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportImage = async () => {
    const src = canvasRef.current;
    if (!src) return;

    // Dla JPG/WebP wypełnij tło (PNG wspiera przezroczystość)
    const needsOpaqueBg = format !== "png";
    const mime =
      format === "png" ? "image/png" :
      format === "jpg" ? "image/jpeg" : "image/webp";

    const target = needsOpaqueBg ? document.createElement("canvas") : src;
    if (needsOpaqueBg) {
      target.width = src.width;
      target.height = src.height;
      const tctx = target.getContext("2d");
      if (!tctx) return;

      // biały (albo podmień na backgroundColor z kontekstu)
      tctx.fillStyle = "#ffffff";
      tctx.fillRect(0, 0, target.width, target.height);
      tctx.drawImage(src, 0, 0);
    }

    // toBlob daje mniejszą pamięć i lepszą kontrolę jakości
    const blob: Blob | null = await new Promise(resolve =>
      target.toBlob(resolve, mime, 0.95)
    );

    if (!blob) return;
    const filename = `${defaultName}.${format === "jpg" ? "jpg" : format}`;
    downloadBlob(blob, filename);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as any)}
        className="border rounded px-2 py-1"
        title="Format pliku"
      >
        <option value="png">PNG (przezroczystość)</option>
        <option value="jpg">JPG</option>
        <option value="webp">WebP</option>
      </select>

      <button
        onClick={exportImage}
        className="px-3 py-2 rounded bg-primary text-primary-foreground"
      >
        Eksportuj
      </button>
    </div>
  );
}
