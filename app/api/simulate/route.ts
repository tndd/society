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
const GRID_SIZE = 100;

// エージェントの初期状態
let agents: Agent[] = [];
for (let i = 1; i <= 10; i++) {
  agents.push({
    id: `agent-${i}`,
    hp: 100,
    atk: 10,
    def: 5,
    mov: 1, // 移動力は一旦1に固定
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  });
}

// エージェントを移動させる関数
const SPLIT_PROBABILITY = 0.01; // 各ステップでの分裂確率 (1%)

function moveAgents() {
  const newAgents: Agent[] = [];

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

    // 確率で分裂
    if (Math.random() < SPLIT_PROBABILITY) {
      const newAgent: Agent = {
        id: `agent-${agents.length + newAgents.length + 1}`, // ユニークなIDを生成
        hp: agent.hp,
        atk: agent.atk,
        def: agent.def,
        mov: agent.mov,
        x: newX, // 分裂したエージェントと同じ位置
        y: newY,
      };
      newAgents.push(newAgent);
    }

    return { ...agent, x: newX, y: newY };
  });

  // 新しいエージェントをリストに追加
  agents = [...agents, ...newAgents];
}

// シミュレーションのステップを実行するAPIルート
export async function GET() {
  moveAgents(); // エージェントを移動させる
  return NextResponse.json(agents);
}