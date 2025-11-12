interface PlayerState {
  // Current position of player
  x: number;
  y: number;
  // Dimension of player
  width: number;
  height: number;
  // Animation states
  velocityY: number;
  velocityX: number;
  speed: number;
  jumpPower: number;
  isJumping: boolean;
  //  1 for right, -1 for left
  direction: 1 | -1;
  frame: number;
  frameTimer: number;
}

interface CameraState {
  x: number;
  y: number;
}

export class CanvasState {
  public ctx: CanvasRenderingContext2D;
  public camera: CameraState;
  public gravity: number;
  // Width of one loop cycle
  public loopWidth: number;

  /** Ground */
  public groundY: number;
  public player: PlayerState;

  public fontFamily: string;

  constructor(public canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context cannot be null');
    }
    this.ctx = ctx;

    this.groundY = canvas.height - 100;
    this.player = {
      // Initial position of player
      x: 100,
      y: this.groundY - 72,
      // dimension of player
      width: 48,
      height: 72,
      velocityY: 0,
      velocityX: 0,
      speed: 5,
      jumpPower: 15,
      isJumping: false,
      direction: 1,
      frame: 0,
      frameTimer: 0,
    };

    this.camera = { x: 0, y: 0 };
    this.gravity = 0.8;
    this.loopWidth = 2000;

    /** Grab font family defined in `layout.tsx` */
    const style = getComputedStyle(document.documentElement);
    this.fontFamily = style.getPropertyValue('--default-font-family');
  }

  /**
   * Clear canvas
   *
   * - Render the canvas blank and fill wil background
   */
  clearCanvas() {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
