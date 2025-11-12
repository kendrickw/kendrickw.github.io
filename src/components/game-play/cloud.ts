import { CanvasState } from './canvas-state';

/**
 * Draw cloud
 *
 * - Provide the top-left coordinate of the cloud to render
 */
export function drawCloud(canvasState: CanvasState, x: number, y: number) {
  const { ctx } = canvasState;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.arc(x + 25, y, 40, 0, Math.PI * 2);
  ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
  ctx.fill();
}
