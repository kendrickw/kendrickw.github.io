'use client';
import { useIsMobile } from '@/hooks/is-mobile';
import { useRegisterControl } from '@/hooks/register-control';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useEventListener, useWindowSize } from 'usehooks-ts';
import { HoverBox } from '../hover-box';
import { TouchControl } from '../touch-control';
import { CanvasState } from './canvas-state';
import { drawCloud } from './cloud';
import { drawControlHint } from './control-hint';
import { drawFlagPole } from './flag-pole';
import { drawInfoBox, getInfoBoxes, type InfoBox } from './info-box';
import { drawIntroScreen } from './intro-screen';
import { drawPlatform, getPlatforms } from './platform';
import { drawPlayer } from './player';
import { drawStageComplete } from './stage-complete';

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
      canvasRef.current.width = windowSize.width;
      canvasRef.current.height = windowSize.height;
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

    const canvasState = new CanvasState(canvas);
    const platforms = getPlatforms(canvasState);
    const infoBoxes = getInfoBoxes(canvasState);

    resizeCanvas();

    let animationId: number;
    const { groundY, player, camera, gravity, loopWidth } = canvasState;

    // Game loop
    const gameLoop = () => {
      canvasState.clearCanvas();

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

        drawCloud(canvasState, cloudX, cloudY);
      }

      // Draw ground
      drawPlatform(canvasState, 0, {
        x: 0,
        y: groundY,
        width: canvas.width,
        height: 20,
      });

      // Draw platforms (and ones in next stage)
      [currentLoop, currentLoop + 1].forEach((loop) => {
        platforms.forEach((platform) => {
          const loopedX = platform.x + loop * loopWidth;
          const screenX = loopedX - camera.x;

          drawPlatform(canvasState, screenX, platform);
        });
      });

      // Calculate InfoBox position given loop index and check if player is near it
      const calcBoxPos = (box: InfoBox, loop: number) => {
        const loopedX = box.x + loop * loopWidth;
        const isNear =
          Math.abs(player.x - loopedX) < 100 &&
          Math.abs(player.y - box.y) < 100;
        return { loopedX, isNear };
      };

      // Show Hoverbox when player is near InfoBox
      const nearBox = infoBoxes.find((box) => {
        const { isNear } = calcBoxPos(box, currentLoop);
        return isNear;
      });
      setHoverBox(nearBox ?? null);

      // Draw InfoBox (and ones in next stage)
      [currentLoop, currentLoop + 1].forEach((loop) => {
        infoBoxes.forEach((box) => {
          const { loopedX, isNear } = calcBoxPos(box, loop);
          const screenX = loopedX - camera.x;

          drawInfoBox(canvasState, screenX, box, isNear);
        });
      });

      // Draw flag poles (and one in next stage)
      [currentLoop, currentLoop + 1].forEach((loop) => {
        if (loop > 0) {
          // Only draw flags after the first loop
          const flagX = loop * loopWidth;
          const screenX = flagX - camera.x;

          drawFlagPole(canvasState, screenX, groundY);
        }
      });

      // Draw player
      drawPlayer(canvasState);

      // Draw UI
      if (!gameStarted) {
        drawIntroScreen(canvasState, showTouchControl);
      } else {
        // Draw controls hint (desktop only)
        if (!showTouchControl) {
          drawControlHint(canvasState);
        }

        // Show message when near flag pole (but not at the start)
        const nearestFlagX = Math.round(player.x / loopWidth) * loopWidth;
        if (nearestFlagX > 0 && Math.abs(player.x - nearestFlagX) < 150) {
          drawStageComplete(canvasState);
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
