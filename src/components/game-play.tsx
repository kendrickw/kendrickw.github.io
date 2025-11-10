'use client';
import { useEffect, useRef, useState } from 'react';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InfoBox {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string[];
  color: string;
}

export function GamePlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchControlsRef = useRef({
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Game state
    let animationId: number;
    const groundY = canvas.height - 100;
    const player = {
      x: 100,
      y: groundY - 72, // Start on the ground instead of falling from sky
      width: 48, // 1.5x larger (32 * 1.5)
      height: 72, // 1.5x larger (48 * 1.5)
      velocityY: 0,
      velocityX: 0,
      speed: 5,
      jumpPower: 15,
      isJumping: false,
      direction: 1, // 1 for right, -1 for left
      frame: 0,
      frameTimer: 0,
    };

    const camera = {
      x: 0,
      y: 0,
    };

    const gravity = 0.8;
    const loopWidth = 2000; // Width of one loop cycle

    // Base platforms (will be repeated)
    const basePlatforms: Platform[] = [
      { x: 300, y: groundY - 100, width: 150, height: 20 },
      { x: 550, y: groundY - 150, width: 150, height: 20 },
      { x: 800, y: groundY - 80, width: 200, height: 20 },
      { x: 1100, y: groundY - 180, width: 150, height: 20 },
      { x: 1350, y: groundY - 100, width: 150, height: 20 },
      { x: 1600, y: groundY - 200, width: 150, height: 20 },
    ];

    // Base info boxes (will be repeated)
    const baseInfoBoxes: InfoBox[] = [
      {
        x: 400,
        y: groundY - 200,
        width: 80,
        height: 80,
        title: '👨‍💻 About',
        content: ['Full Stack Developer', 'Game Enthusiast', 'Pixel Art Lover'],
        color: '#4CAF50',
      },
      {
        x: 900,
        y: groundY - 180,
        width: 80,
        height: 80,
        title: '🛠️ Skills',
        content: ['React & Next.js', 'TypeScript', 'Node.js', 'Game Dev'],
        color: '#2196F3',
      },
      {
        x: 1400,
        y: groundY - 200,
        width: 80,
        height: 80,
        title: '📫 Contact',
        content: ['GitHub', 'LinkedIn', 'Email'],
        color: '#FF9800',
      },
    ];

    let hoveredBox: InfoBox | null = null as InfoBox | null;

    // Keyboard state
    const keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (
        !gameStarted &&
        (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === ' ')
      ) {
        setGameStarted(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Draw flag pole
    const drawFlagPole = (x: number, y: number) => {
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
    };

    // Draw pixel art character
    const drawCharacter = (
      x: number,
      y: number,
      direction: number,
      frame: number
    ) => {
      ctx.save();
      ctx.translate(x + player.width / 2, y);
      if (direction === -1) {
        ctx.scale(-1, 1);
      }
      ctx.translate(-player.width / 2, 0);

      // Chibi proportions: Head is ~50% of total height, body is smaller
      // Character fits in 48x72 box

      // Skin tone
      ctx.fillStyle = '#D4A574';

      // Head (much larger for chibi style - 30x30)
      ctx.fillRect(9, 0, 30, 30);

      // Hair (black) - fuller, rounder for chibi
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(6, 0, 36, 14); // Top
      ctx.fillRect(6, 0, 6, 24); // Left side
      ctx.fillRect(36, 0, 6, 24); // Right side
      // Hair spikes for anime style
      ctx.fillRect(12, -4, 5, 5);
      ctx.fillRect(21, -5, 6, 6);
      ctx.fillRect(31, -4, 5, 5);

      // Face outline (lighter for depth)
      ctx.fillStyle = '#D4A574';
      ctx.fillRect(12, 10, 24, 18);

      // Glasses frame (thicker for chibi)
      ctx.fillStyle = '#333';
      ctx.fillRect(14, 14, 8, 8); // Left lens
      ctx.fillRect(26, 14, 8, 8); // Right lens
      ctx.fillRect(22, 16, 4, 3); // Bridge

      // Glasses lenses (reflective)
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(15, 15, 6, 6);
      ctx.fillRect(27, 15, 6, 6);

      // Eyes (larger anime eyes behind glasses)
      ctx.fillStyle = '#000';
      ctx.fillRect(16, 16, 4, 4); // Left eye
      ctx.fillRect(28, 16, 4, 4); // Right eye

      // Eye highlights (anime style)
      ctx.fillStyle = '#FFF';
      ctx.fillRect(17, 17, 2, 2);
      ctx.fillRect(29, 17, 2, 2);

      // Cute smile
      ctx.fillStyle = '#000';
      ctx.fillRect(20, 24, 8, 2);
      ctx.fillRect(18, 23, 2, 2);
      ctx.fillRect(28, 23, 2, 2);

      // Body (shirt) - smaller for chibi proportions
      ctx.fillStyle = '#3498db';
      ctx.fillRect(12, 30, 24, 18);

      // Collar/neck
      ctx.fillStyle = '#2980b9';
      ctx.fillRect(18, 30, 12, 3);

      // Arms (shorter and cuter)
      const armOffset = Math.sin(frame * 0.3) * 3;
      ctx.fillStyle = '#3498db';
      ctx.fillRect(4, 32 + armOffset, 8, 12); // Left arm
      ctx.fillRect(36, 32 - armOffset, 8, 12); // Right arm

      // Hands
      ctx.fillStyle = '#D4A574';
      ctx.fillRect(4, 43 + armOffset, 8, 4);
      ctx.fillRect(36, 43 - armOffset, 8, 4);

      // Legs (short and stubby for chibi)
      const legOffset = Math.sin(frame * 0.3) * 4;
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(15, 48, 8, 14); // Left leg
      ctx.fillRect(25, 48, 8, 14); // Right leg

      // Feet (larger for chibi cuteness)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(13, 61 + legOffset, 11, 6); // Left foot
      ctx.fillRect(24, 61 - legOffset, 11, 6); // Right foot

      ctx.restore();
    };

    // Game loop
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 5; i++) {
        const cloudX = (i * 400 - camera.x * 0.3) % (canvas.width + 200);
        ctx.beginPath();
        ctx.arc(cloudX, 100 + i * 50, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, 100 + i * 50, 40, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, 100 + i * 50, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Handle input (keyboard + touch)
      if (keys['ArrowRight'] || touchControlsRef.current.right) {
        player.velocityX = player.speed;
        player.direction = 1;
        player.frameTimer++;
      } else if (keys['ArrowLeft'] || touchControlsRef.current.left) {
        player.velocityX = -player.speed;
        player.direction = -1;
        player.frameTimer++;
      } else {
        player.velocityX = 0;
        player.frameTimer = 0;
      }

      if (
        (keys[' '] || keys['ArrowUp'] || touchControlsRef.current.jump) &&
        !player.isJumping
      ) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
      }

      // Update player position
      player.x += player.velocityX;
      player.velocityY += gravity;
      player.y += player.velocityY;

      // Animation frame
      if (player.frameTimer > 0) {
        player.frame = Math.floor(player.frameTimer / 5) % 8;
      } else {
        player.frame = 0;
      }

      // Keep player in bounds horizontally
      if (player.x < 0) player.x = 0;

      // Update camera
      camera.x = player.x - canvas.width / 3;
      if (camera.x < 0) camera.x = 0;

      // Check collision with looped platforms
      const currentLoop = Math.floor(camera.x / loopWidth);
      player.isJumping = true;
      for (let loop = currentLoop - 1; loop <= currentLoop + 1; loop++) {
        basePlatforms.forEach((platform) => {
          const loopedX = platform.x + loop * loopWidth;
          if (
            player.x + player.width > loopedX &&
            player.x < loopedX + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.velocityY > 0
          ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
          }
        });
      }

      // Fallback ground check - prevent falling through floor
      if (player.y + player.height > groundY) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.isJumping = false;
      }

      // Draw ground (infinite)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, groundY, canvas.width, 20);
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, groundY - 5, canvas.width, 5);

      // Draw platforms (with looping)
      ctx.fillStyle = '#8B4513';
      for (let loop = currentLoop - 1; loop <= currentLoop + 1; loop++) {
        basePlatforms.forEach((platform) => {
          const loopedX = platform.x + loop * loopWidth;
          const screenX = loopedX - camera.x;

          // Only draw if visible on screen
          if (screenX + platform.width > 0 && screenX < canvas.width) {
            ctx.fillRect(screenX, platform.y, platform.width, platform.height);

            // Grass on top
            ctx.fillStyle = '#228B22';
            ctx.fillRect(screenX, platform.y - 5, platform.width, 5);
            ctx.fillStyle = '#8B4513';
          }
        });
      }

      // Check and draw info boxes (with looping)
      hoveredBox = null;
      for (let loop = currentLoop - 1; loop <= currentLoop + 1; loop++) {
        baseInfoBoxes.forEach((box) => {
          const loopedX = box.x + loop * loopWidth;
          const screenX = loopedX - camera.x;
          const isNear =
            Math.abs(player.x - loopedX) < 100 &&
            Math.abs(player.y - box.y) < 100;

          if (isNear) hoveredBox = box;

          // Only draw if visible on screen
          if (screenX + box.width > 0 && screenX < canvas.width) {
            // Draw box with glow effect
            ctx.save();
            ctx.shadowBlur = isNear ? 20 : 10;
            ctx.shadowColor = box.color;
            ctx.fillStyle = box.color;
            ctx.fillRect(screenX, box.y, box.width, box.height);
            ctx.restore();

            // Draw icon/title
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
              box.title.split(' ')[0],
              screenX + box.width / 2,
              box.y + box.height / 2 + 8
            );
          }
        });
      }

      // Draw flag poles at loop points (skip the first one at x=0)
      for (let loop = currentLoop; loop <= currentLoop + 1; loop++) {
        if (loop > 0) {
          // Only draw flags after the first loop
          const flagX = loop * loopWidth;
          const screenFlagX = flagX - camera.x;
          if (screenFlagX > -100 && screenFlagX < canvas.width + 100) {
            drawFlagPole(screenFlagX, groundY);
          }
        }
      }

      // Draw player
      drawCharacter(
        player.x - camera.x,
        player.y,
        player.direction,
        player.frame
      );

      // Draw UI
      if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        const titleSize = canvas.width < 768 ? 32 : 48;
        const textSize = canvas.width < 768 ? 16 : 24;
        ctx.font = `bold ${titleSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(
          "Kendrick's Adventure",
          canvas.width / 2,
          canvas.height / 2 - 50
        );
        ctx.font = `${textSize}px Arial`;
        if (canvas.width >= 768) {
          ctx.fillText(
            'Use Arrow Keys or WASD to move',
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
        } else {
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
        }
      }

      // Draw info panel
      if (hoveredBox && gameStarted) {
        const box = hoveredBox as InfoBox;
        const panelWidth = 300;
        const panelHeight = 200;
        const panelX = canvas.width - panelWidth - 20;
        const panelY = 20;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        ctx.strokeStyle = box.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(box.title, panelX + 20, panelY + 40);

        ctx.font = '18px Arial';
        box.content.forEach((line: string, i: number) => {
          ctx.fillText(line, panelX + 20, panelY + 80 + i * 30);
        });
      }

      // Draw controls hint (desktop only)
      if (gameStarted && canvas.width >= 768) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, 10, 200, 80);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Controls:', 20, 30);
        ctx.fillText('← → : Move', 20, 50);
        ctx.fillText('Space/↑ : Jump', 20, 70);
      }

      // Show message when near flag pole (but not at the start)
      const nearestFlagX = Math.round(player.x / loopWidth) * loopWidth;
      if (
        gameStarted &&
        nearestFlagX > 0 &&
        Math.abs(player.x - nearestFlagX) < 150
      ) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          canvas.width / 2 - 150,
          canvas.height / 2 - 50,
          300,
          100
        );
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          'Loop Complete!',
          canvas.width / 2,
          canvas.height / 2 - 10
        );
        ctx.font = '18px Arial';
        ctx.fillStyle = '#fff';
        const loopNumber = Math.floor(player.x / loopWidth) + 1;
        ctx.fillText(
          `Starting loop ${loopNumber}...`,
          canvas.width / 2,
          canvas.height / 2 + 20
        );
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [gameStarted]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start game if touching the canvas directly, not the buttons
    if (!gameStarted && e.target === canvasRef.current) {
      setGameStarted(true);
    }
  };

  const handleButtonPress = (
    button: 'left' | 'right' | 'jump',
    e: React.TouchEvent | React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Start game if not started (for movement buttons only, not jump)
    if (!gameStarted && (button === 'left' || button === 'right')) {
      setGameStarted(true);
    }

    touchControlsRef.current[button] = true;
  };

  const handleButtonRelease = (
    button: 'left' | 'right' | 'jump',
    e: React.TouchEvent | React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    touchControlsRef.current[button] = false;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="block"
        style={{ imageRendering: 'pixelated' }}
        onTouchStart={handleTouchStart}
      />

      {/* Mobile Controls */}
      {isMobile && gameStarted && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-4 pb-8">
          {/* Left Side - Movement Controls */}
          <div className="pointer-events-auto flex gap-3">
            {/* Left Button */}
            <button
              onTouchStart={(e) => handleButtonPress('left', e)}
              onTouchEnd={(e) => handleButtonRelease('left', e)}
              onMouseDown={(e) => handleButtonPress('left', e)}
              onMouseUp={(e) => handleButtonRelease('left', e)}
              onMouseLeave={(e) => handleButtonRelease('left', e)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl backdrop-blur-sm active:bg-white/40"
              style={{ touchAction: 'none' }}
            >
              ←
            </button>

            {/* Right Button */}
            <button
              onTouchStart={(e) => handleButtonPress('right', e)}
              onTouchEnd={(e) => handleButtonRelease('right', e)}
              onMouseDown={(e) => handleButtonPress('right', e)}
              onMouseUp={(e) => handleButtonRelease('right', e)}
              onMouseLeave={(e) => handleButtonRelease('right', e)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl backdrop-blur-sm active:bg-white/40"
              style={{ touchAction: 'none' }}
            >
              →
            </button>
          </div>

          {/* Right Side - Jump Button */}
          <div className="pointer-events-auto">
            <button
              onTouchStart={(e) => handleButtonPress('jump', e)}
              onTouchEnd={(e) => handleButtonRelease('jump', e)}
              onMouseDown={(e) => handleButtonPress('jump', e)}
              onMouseUp={(e) => handleButtonRelease('jump', e)}
              onMouseLeave={(e) => handleButtonRelease('jump', e)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-xl font-bold backdrop-blur-sm active:bg-white/40"
              style={{ touchAction: 'none' }}
            >
              JUMP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
