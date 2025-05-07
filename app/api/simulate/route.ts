import { NextResponse } from 'next/server';

// エージェントのデータ構造
interface Agent {
  id: string;
  hp: number;
  atk: number;
  def: number;
  mov: number;
  x: number; // グリッド上のX座標
  y: number; // グリッド上のY座標
}

// グリッドのサイズ
const GRID_SIZE = 10;

// エージェントの初期状態
let agents: Agent[] = [
  { id: 'agent-1', hp: 100, atk: 10, def: 5, mov: 1, x: 0, y: 0 },
  { id: 'agent-2', hp: 80, atk: 12, def: 6, mov: 2, x: 9, y: 9 },
];

// エージェントを移動させる関数
function moveAgents() {
  agents = agents.map(agent => {
    // ランダムな方向に移動 (上下左右)
    const direction = Math.floor(Math.random() * 4);
    let newX = agent.x;
    let newY = agent.y;

    switch (direction) {
      case 0: // 上
        newY = Math.max(0, agent.y - agent.mov);
        break;
      case 1: // 下
        newY = Math.min(GRID_SIZE - 1, agent.y + agent.mov);
        break;
      case 2: // 左
        newX = Math.max(0, agent.x - agent.mov);
        break;
      case 3: // 右
        newX = Math.min(GRID_SIZE - 1, agent.x + agent.mov);
        break;
    }

    return { ...agent, x: newX, y: newY };
  });
}

// シミュレーションのステップを実行するAPIルート
export async function GET() {
  moveAgents(); // エージェントを移動させる
  return NextResponse.json(agents);
}