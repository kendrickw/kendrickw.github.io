import { Icon } from '@iconify/react';
import React from 'react';
import { CanvasState } from './canvas-state';

export interface InfoBox {
  x: number;
  y: number;
  label: string;
  color: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export function getInfoBoxes(canvasState: CanvasState) {
  const { groundY } = canvasState;
  return [
    {
      x: 400,
      y: groundY - 200,
      color: '#4CAF50',
      label: '🙋🏻‍♂️',
      title: "🙋🏻‍♂️ I'm Kendrick!",
      content: (
        <ul>
          <li>✨ Full Stack Developer by day.</li>
          <li>🧙‍♂️ Stack Whisperer by night.</li>
        </ul>
      ),
    },
    {
      x: 900,
      y: groundY - 180,
      color: '#2156A3',
      label: '🧰',
      title: '🧰 My Dev Toolbox',
      content: (
        <ul>
          <li className="flex items-center gap-2">
            <Icon icon="devicon:react" />
            React & Next.js
          </li>
          <li className="flex items-center gap-2">
            <Icon icon="devicon:tailwindcss" />
            TailwindCSS
          </li>
          <li className="flex items-center gap-2">
            <Icon icon="devicon:nodejs" />
            Node.js
          </li>
          <li className="flex items-center gap-2">
            <Icon icon="material-icon-theme:prisma" />
            Prisma
          </li>
          <li className="flex items-center gap-2">
            <Icon icon="devicon:azure" />
            Azure
          </li>
          <li className="flex items-center gap-2">
            <Icon icon="fa6-brands:aws" />
            AWS
          </li>
          <li className="flex items-center gap-2">
            <Icon icon="devicon:googlecloud" />
            Google
          </li>
        </ul>
      ),
    },
    {
      x: 1400,
      y: groundY - 200,
      color: '#FF9800',
      label: '📫',
      title: '📫 Contact',
      content: (
        <ul>
          <li className="flex items-center gap-2">
            <Icon color="white" icon="mdi:github" />
            <a href="https://github.com/kendrickw">kendrickw</a>
          </li>
          <li className="flex items-center gap-2">
            <Icon icon="devicon:linkedin" />
            <a href="https://www.linkedin.com/in/kendrickwong0">
              kendrickwong0
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Icon color="orange" icon="memory:email" />
            <a href="mailto:kendrickw@luumitech.com">kendrickw@luumitech.com</a>
          </li>
        </ul>
      ),
    },
  ];
}

/**
 * Draw InfoBox
 *
 * - Glows when `isNear` flag is true
 */
export function drawInfoBox(
  canvasState: CanvasState,
  x: number,
  box: InfoBox,
  isNear: boolean
) {
  const { ctx, fontFamily } = canvasState;

  const boxWidth = 80;
  const boxHeight = 80;

  ctx.save();
  // Add Glow effect
  ctx.shadowBlur = isNear ? 30 : 10;
  ctx.shadowColor = box.color;
  ctx.fillStyle = box.color;
  ctx.fillRect(x, box.y, boxWidth, boxHeight);
  ctx.restore();

  // Label on Info box
  ctx.fillStyle = '#fff';
  ctx.font = `24px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.fillText(box.label, x + boxWidth / 2, box.y + boxHeight / 2 + 8);
}
