import { GameEngine } from './';

export class Platform {
  constructor(
    protected gameEngine: GameEngine,
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  /** Get the default level ground */
  static getGround(gameEngine: GameEngine) {
    const { groundY, canvas } = gameEngine;
    return new Platform(gameEngine, 0, groundY, canvas.width, 20);
  }

  static getPlatforms(gameEngine: GameEngine) {
    const { groundY } = gameEngine;

    const configList = [
      { x: 300, y: groundY - 100, width: 150, height: 20 },
      { x: 550, y: groundY - 150, width: 150, height: 20 },
      { x: 800, y: groundY - 80, width: 200, height: 20 },
      { x: 1100, y: groundY - 180, width: 150, height: 20 },
      { x: 1350, y: groundY - 100, width: 150, height: 20 },
      { x: 1600, y: groundY - 200, width: 150, height: 20 },
    ];

    return configList.map((config) => {
      const { x, y, width, height } = config;
      return new Platform(gameEngine, x, y, width, height);
    });
  }

  /**
   * Draw platform
   *
   * - Optionally provide an x-offset
   */
  draw(offsetX: number = 0) {
    const { ctx } = this.gameEngine;
    const x = this.x + offsetX;

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, this.y, this.width, this.height);

    // Grass on top
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x, this.y - 5, this.width, 5);
  }
}
