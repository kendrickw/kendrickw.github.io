import { GameEngine } from './';

export class Cloud {
  constructor(protected gameEngine: GameEngine) {}

  /**
   * Draw cloud
   *
   * - Provide the top-left coordinate of the cloud to render
   */
  draw(x: number, y: number) {
    const { ctx } = this.gameEngine;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 40, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}
