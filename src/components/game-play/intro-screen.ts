import { CanvasState } from './canvas-state';

/**
 * Draw Introduction screen
 *
 * - Should instruct player on how to start the game
 */
export function drawIntroScreen(
  canvasState: CanvasState,
  useTouchControl: boolean
) {
  const { ctx, canvas, fontFamily } = canvasState;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  const titleSize = canvas.width < 768 ? 32 : 48;
  const textSize = canvas.width < 768 ? 20 : 24;

  ctx.font = `bold ${titleSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.fillText(
    "Kendrick's Adventure",
    canvas.width / 2,
    canvas.height / 2 - 50
  );
  ctx.font = `${textSize}px ${fontFamily}`;

  if (useTouchControl) {
    ctx.fillText(
      'Use on-screen buttons',
      canvas.width / 2,
      canvas.height / 2 + 20
    );
    ctx.fillText(
      'Tap anywhere to start!',
      canvas.width / 2,
      canvas.height / 2 + 60
    );
  } else {
    ctx.fillText(
      'Use Arrow Keys to move',
      canvas.width / 2,
      canvas.height / 2 + 20
    );
    ctx.fillText(
      'Space or Up to jump',
      canvas.width / 2,
      canvas.height / 2 + 60
    );
    ctx.fillText(
      'Press any key to start!',
      canvas.width / 2,
      canvas.height / 2 + 120
    );
  }
}
