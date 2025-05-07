"use client";

import { useEffect, useState } from 'react';

// エージェントのデータ構造 (バックエンドと合わせる)
interface Agent {
  id: string;
  hp: number;
  atk: number;
  def: number;
  mov: number;
  x: number; // グリッド上のX座標
  y: number; // グリッド上のY座標
}

// グリッドのサイズ (バックエンドと合わせる)
const GRID_SIZE = 100;
const CELL_SIZE = 4; // グリッドセルのサイズ (px)

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      const res = await fetch('/api/simulate');
      const data: Agent[] = await res.json();
      setAgents(data);
    };

    // 初回フェッチ
    fetchAgents();

    // 一定間隔でフェッチ (例: 500msごと)
    const intervalId = setInterval(fetchAgents, 500);

    // クリーンアップ関数
    return () => clearInterval(intervalId);
  }, []); // 空の依存配列でマウント時に一度だけ実行

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* グリッドコンテナ */}
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
    </div>
  );
}
