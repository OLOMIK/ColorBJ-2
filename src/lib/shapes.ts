export function drawShape(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  switch (type) {
    case 'rectangle':
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      break;

    case 'circle':
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'star':
      const spikes = 5;
      const outerRadius = size / 2;
      const innerRadius = size / 4;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(x, y - outerRadius);

      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(
          x + Math.cos(rot) * outerRadius,
          y + Math.sin(rot) * outerRadius
        );
        rot += step;

        ctx.lineTo(
          x + Math.cos(rot) * innerRadius,
          y + Math.sin(rot) * innerRadius
        );
        rot += step;
      }

      ctx.lineTo(x, y - outerRadius);
      ctx.closePath();
      ctx.fill();
      break;

    case 'arrow':
      const arrowSize = size;
      ctx.beginPath();
      // Arrow body
      ctx.moveTo(x - arrowSize / 2, y);
      ctx.lineTo(x + arrowSize / 4, y);
      // Arrow head
      ctx.lineTo(x + arrowSize / 4, y - arrowSize / 4);
      ctx.lineTo(x + arrowSize / 2, y);
      ctx.lineTo(x + arrowSize / 4, y + arrowSize / 4);
      ctx.lineTo(x + arrowSize / 4, y);
      ctx.lineTo(x - arrowSize / 2, y);
      ctx.closePath();
      ctx.fill();
      break;
  }
}
