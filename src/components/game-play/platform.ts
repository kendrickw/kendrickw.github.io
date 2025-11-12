import { CanvasState } from './canvas-state';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getPlatforms(canvasState: CanvasState) {
  const { groundY } = canvasState;
  return [
    { x: 300, y: groundY - 100, width: 150, height: 20 },
    { x: 550, y: groundY - 150, width: 150, height: 20 },
    { x: 800, y: groundY - 80, width: 200, height: 20 },
    { x: 1100, y: groundY - 180, width: 150, height: 20 },
    { x: 1350, y: groundY - 100, width: 150, height: 20 },
    { x: 1600, y: groundY - 200, width: 150, height: 20 },
  ];
}

// Draw platforms
export function drawPlatform(
  canvasState: CanvasState,
  x: number,
  platform: Platform
) {
  const { ctx } = canvasState;

  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x, platform.y, platform.width, platform.height);

  // Grass on top
  ctx.fillStyle = '#228B22';
  ctx.fillRect(x, platform.y - 5, platform.width, 5);
}
