"use client";

import { Agent } from '@/types/agent';

// グリッドのサイズ (バックエンドと合わせる)
const GRID_SIZE = 100;
const CELL_SIZE = 4; // グリッドセルのサイズ (px)

interface SimulationGridProps {
  agents: Agent[];
}

const SimulationGrid: React.FC<SimulationGridProps> = ({ agents }) => {
  return (
    <div
      className="relative border border-gray-400"
      style={{
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE,
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
      }}
    >
      {/* グリッドセル */}
      {[...Array(GRID_SIZE * GRID_SIZE)].map((_, index) => (
        <div
          key={index}
          className="border border-gray-300"
        ></div>
      ))}

      {/* エージェント */}
      {agents.map(agent => (
        <div
          key={agent.id}
          className={`absolute rounded-full ${agent.hp <= 10 ? 'bg-red-500' : agent.hp <= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            top: agent.y * CELL_SIZE,
            left: agent.x * CELL_SIZE,
            transition: 'top 0.1s linear, left 0.1s linear', // より速い移動
          }}
        >
        </div>
      ))}
    </div>
  );
};

export default SimulationGrid;