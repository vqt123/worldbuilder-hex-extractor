import { HexCoordinates } from '../types';

export const useHexOperations = () => {
  const hexToPixel = (q: number, r: number, hexSize: number) => {
    // Use exact same formula as backend
    const x = hexSize * (3/2 * q);
    const y = hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x, y };
  };

  const pixelToHex = (x: number, y: number, hexSize: number): HexCoordinates => {
    // Use exact same formula as backend
    const q = (2/3 * x) / hexSize;
    const r = (-1/3 * x + Math.sqrt(3)/3 * y) / hexSize;
    return roundHex(q, r);
  };

  const roundHex = (q: number, r: number): HexCoordinates => {
    const s = -q - r;
    const rq = Math.round(q);
    const rr = Math.round(r);
    const rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      return { q: -rr - rs, r: rr };
    } else if (rDiff > sDiff) {
      return { q: rq, r: -rq - rs };
    } else {
      return { q: rq, r: rr };
    }
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      // Match backend hex orientation - flat top hexagon
      const angle = (Math.PI / 3) * i;
      const hx = x + size * Math.cos(angle);
      const hy = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(hx, hy);
      } else {
        ctx.lineTo(hx, hy);
      }
    }
    ctx.closePath();
    ctx.stroke();
  };

  return {
    hexToPixel,
    pixelToHex,
    roundHex,
    drawHexagon
  };
};