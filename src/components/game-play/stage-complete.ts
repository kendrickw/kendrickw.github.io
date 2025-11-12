import { CanvasState } from './canvas-state';

/** Draw stage complete notice board */
export function drawStageComplete(canvasState: CanvasState) {
  const { ctx, canvas, fontFamily, player, loopWidth } = canvasState;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.strokeRect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100);
  ctx.fillStyle = '#FFD700';
  ctx.font = `bold 24px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.fillText('Stage Complete!', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = `18px ${fontFamily}`;

  const loopNumber = Math.floor((player.x + 150) / loopWidth) + 1;
  ctx.fillStyle = '#fff';
  ctx.fillText(
    `Proceed to stage ${loopNumber}...`,
    canvas.width / 2,
    canvas.height / 2 + 20
  );
}
