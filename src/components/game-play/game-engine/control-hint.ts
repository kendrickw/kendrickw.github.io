import { GameEngine } from './';

export class ControlHint {
  constructor(protected gameEngine: GameEngine) {}

  /**
   * Draw control hint
   *
   * - Top left corner text box to provide instruction on how to move character
   * - Appears when player can be controlled via keyboard
   */
  draw() {
    const { ctx, fontFamily } = this.gameEngine;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 150, 75);
    ctx.fillStyle = '#fff';
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText('Controls:', 20, 30);
    ctx.fillText('⇦ ⇨ : Move', 20, 50);
    ctx.fillText('Space / ⇧ : Jump', 20, 70);
  }
}
