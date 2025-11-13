'use client';
import { useIsMobile } from '@/hooks/is-mobile';
import { useRegisterControl } from '@/hooks/register-control';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useEventListener, useWindowSize } from 'usehooks-ts';
import { HoverBox } from '../hover-box';
import { TouchControl } from '../touch-control';
import { GameEngine } from './game-engine';
import { InfoBox } from './game-engine/info-box';
import { Platform } from './game-engine/platform';

interface Props {
  className?: string;
}

export const GamePlay: React.FC<Props> = ({ className }) => {
  const windowSize = useWindowSize();
  const isMobile = useIsMobile();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = React.useState(false);
  const [hoverBox, setHoverBox] = React.useState<InfoBox | null>(null);
  const [controlRef, updateControl] = useRegisterControl({
    onKeyDown: () => {
      if (!gameStarted) {
        setGameStarted(true);
      }
    },
  });

  const resizeCanvas = React.useCallback(() => {
    if (canvasRef.current) {
      if (
        canvasRef.current.width !== windowSize.width ||
        canvasRef.current.height !== windowSize.height
      ) {
        setGameStarted(false);
        canvasRef.current.width = windowSize.width;
        canvasRef.current.height = windowSize.height;
      }
    }
  }, [windowSize]);
  useEventListener('resize', resizeCanvas);

  const showTouchControl = React.useMemo(() => {
    return gameStarted && (isMobile || windowSize.width < 768);
  }, [gameStarted, isMobile, windowSize.width]);

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      // Only start game if touching the canvas directly, not the buttons
      if (!gameStarted && e.target === canvasRef.current) {
        setGameStarted(true);
      }
    },
    [gameStarted]
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gameEngine = new GameEngine(canvas);

    resizeCanvas();

    let animationId: number;
    const {
      groundY,
      player,
      camera,
      gravity,
      loopWidth,
      platforms,
      infoBoxes,
    } = gameEngine;

    // Game loop
    const gameLoop = () => {
      gameEngine.clearCanvas();

      // Handle input
      if (controlRef.current.right) {
        player.velocityX = player.speed;
        player.direction = 1;
        player.frameTimer++;
      } else if (controlRef.current.left) {
        player.velocityX = -player.speed;
        player.direction = -1;
        player.frameTimer++;
      } else {
        player.velocityX = 0;
        player.frameTimer = 0;
      }

      if (controlRef.current.jump && !player.isJumping) {
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

      // Collision detection with platforms
      const currentLoop = Math.floor(camera.x / loopWidth);
      player.isJumping = true;
      [currentLoop, currentLoop + 1].forEach((loop) => {
        platforms.forEach((platform) => {
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
      });

      // Fallback ground check - prevent falling through floor
      if (player.y + player.height > groundY) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.isJumping = false;
      }

      // Draw clouds
      for (let i = 0; i < 5; i++) {
        const cloudSpeed = i % 2 ? 0.3 : 0.5;
        const cloudX =
          (i * canvas.width * 0.4 + camera.x * cloudSpeed) % canvas.width;
        const cloudY = 100 + i * 50;

        gameEngine.cloud.draw(cloudX, cloudY);
      }

      // Draw ground
      const ground = new Platform(gameEngine, 0, groundY, canvas.width, 20);
      ground.draw();

      // Draw platforms (and ones in next stage)
      [currentLoop, currentLoop + 1].forEach((loop) => {
        platforms.forEach((platform) => {
          platform.draw(loop * loopWidth - camera.x);
        });
      });

      // Calculate InfoBox position given loop index and check if player is near it
      const isNearBox = (box: InfoBox, loop: number) => {
        const loopedX = box.x + loop * loopWidth;
        const isNear =
          Math.abs(player.x - loopedX) < 100 &&
          Math.abs(player.y - box.y) < 100;
        return isNear;
      };

      // Show Hoverbox when player is near InfoBox
      const nearBox = infoBoxes.find((box) => {
        const isNear = isNearBox(box, currentLoop);
        return isNear;
      });
      setHoverBox(nearBox ?? null);

      // Draw InfoBox (and ones in next stage)
      [currentLoop, currentLoop + 1].forEach((loop) => {
        infoBoxes.forEach((box) => {
          const isNear = isNearBox(box, loop);
          box.draw(loop * loopWidth - camera.x, isNear);
        });
      });

      // Draw flag poles (and one in next stage)
      [currentLoop, currentLoop + 1].forEach((loop) => {
        if (loop > 0) {
          // Only draw flags after the first loop
          gameEngine.flagPole.draw(loop * loopWidth - camera.x);
        }
      });

      // Draw player
      player.draw();

      // Draw UI
      if (!gameStarted) {
        gameEngine.introScreen.draw(showTouchControl);
      } else {
        // Draw controls hint (desktop only)
        if (!showTouchControl) {
          gameEngine.controlHint.draw();
        }

        // Show message when near flag pole (but not at the start)
        const nearestFlagX = Math.round(player.x / loopWidth) * loopWidth;
        if (nearestFlagX > 0 && Math.abs(player.x - nearestFlagX) < 150) {
          gameEngine.stageComplete.draw();
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameStarted, controlRef, showTouchControl, resizeCanvas]);

  return (
    <div className={twMerge('relative h-dvh w-dvw overflow-hidden', className)}>
      <canvas ref={canvasRef} onTouchStart={handleTouchStart} />

      {hoverBox && (
        <div className="absolute right-4 top-4">
          <HoverBox borderColor={hoverBox.color} title={hoverBox.title}>
            {hoverBox.content}
          </HoverBox>
        </div>
      )}

      {/* Mobile Controls */}
      <TouchControl showControl={showTouchControl} onPress={updateControl} />
    </div>
  );
};
