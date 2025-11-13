import { GameEngine } from './';

export class FlagPole {
  constructor(protected gameEngine: GameEngine) {}

  /**
   * Draw Flag Pole
   *
   * - Optionally provide an x-offset
   */
  draw(offsetX: number = 0) {
    const { groundY } = this.gameEngine;
    const x = offsetX;
    const y = groundY;

    const { ctx } = this.gameEngine;
    ctx.save();

    // Pole
    ctx.fillStyle = '#8B8B8B';
    ctx.fillRect(x, y - 200, 8, 200);

    // Pole top
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + 4, y - 200, 8, 0, Math.PI * 2);
    ctx.fill();

    // Flag
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 190);
    ctx.lineTo(x + 60, y - 170);
    ctx.lineTo(x + 8, y - 150);
    ctx.closePath();
    ctx.fill();

    // Flag pattern (checkered)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 15, y - 185, 10, 10);
    ctx.fillRect(x + 35, y - 185, 10, 10);
    ctx.fillRect(x + 25, y - 175, 10, 10);
    ctx.fillRect(x + 45, y - 175, 10, 10);
    ctx.fillRect(x + 15, y - 165, 10, 10);
    ctx.fillRect(x + 35, y - 165, 10, 10);

    ctx.restore();
  }
}
