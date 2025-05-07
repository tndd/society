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
let agentIdCounter = 0; // グローバルなエージェントIDカウンター
let totalDamageExchanged = 0; // ダメージやり取りの累計
let totalDeathsByInteraction = 0; // ダメージやり取りによる死亡数

for (let i = 0; i < 10; i++) { // 初期エージェント数を10体に修正
  agents.push({
    id: `agent-${agentIdCounter++}`, // カウンターを使用してIDを生成
    hp: Math.floor(Math.random() * 81) + 20, // 20から100の間でランダム
    atk: Math.floor(Math.random() * 101), // 0から100の間でランダム
    def: Math.floor(Math.random() * 101), // 0から100の間でランダム
    mov: Math.floor(Math.random() * 5) + 1, // 移動力は1から5の間でランダムに設定
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  });
}

// エージェントを移動させる関数
const SPLIT_PROBABILITY = 0.05; // 各ステップでの分裂確率 (5%)

function moveAgents() {
  const newAgents: Agent[] = [];
  const nextAgents: Agent[] = [];

  agents.forEach(agent => {
    // HPを1減らす
    const newHp = agent.hp - 1;

    // HPが0以下になったエージェントは消滅
    if (newHp <= 0) {
      return; // このエージェントは次のステップに進まない
    }

    // ランダムな方向に移動 (8方向)
    const direction = Math.floor(Math.random() * 8);
    let dx = 0;
    let dy = 0;

    switch (direction) {
      case 0: // 上
        dy = -1;
        break;
      case 1: // 下
        dy = 1;
        break;
      case 2: // 左
        dx = -1;
        break;
      case 3: // 右
        dx = 1;
        break;
      case 4: // 左上
        dx = -1;
        dy = -1;
        break;
      case 5: // 右上
        dx = 1;
        dy = -1;
        break;
      case 6: // 左下
        dx = -1;
        dy = 1;
        break;
      case 7: // 右下
        dx = 1;
        dy = 1;
        break;
    }

    // 移動距離はagent.movを使用
    const moveDistance = agent.mov;

    // 移動距離と方向を考慮した新しい座標
    let newX = agent.x + dx * moveDistance;
    let newY = agent.y + dy * moveDistance;

    // グリッドの境界内に収まるように調整
    newX = Math.max(0, Math.min(GRID_SIZE - 1, newX));
    newY = Math.max(0, Math.min(GRID_SIZE - 1, newY));

    // 移動後のエージェントを次のステップのリストに追加
    nextAgents.push({ ...agent, hp: newHp, x: newX, y: newY });

    // 確率で分裂
    if (Math.random() < SPLIT_PROBABILITY) {
      const newAgent: Agent = {
        id: `agent-${agentIdCounter++}`, // カウンターを使用してユニークなIDを生成
        hp: Math.floor(Math.random() * 21) + 80, // 80から100の間でランダム
        atk: Math.floor(Math.random() * 101), // 0から100の間でランダム
        def: Math.floor(Math.random() * 101), // 0から100の間でランダム
        mov: agent.mov,
        x: agent.x, // 分裂したエージェントは元の位置に生成
        y: agent.y,
      };
      newAgents.push(newAgent);
    }
  });

  // セルごとのエージェントリストを作成
  const agentsByCell = new Map<string, Agent[]>();
  nextAgents.forEach(agent => {
    const cellKey = `${agent.x},${agent.y}`;
    if (!agentsByCell.has(cellKey)) {
      agentsByCell.set(cellKey, []);
    }
    agentsByCell.get(cellKey)!.push(agent);
  });

  // HP吸収の計算とエージェントのフィルタリング
  const finalAgents: Agent[] = [];
  agentsByCell.forEach(cellAgents => {
    if (cellAgents.length > 1) {
      // 同じセルに複数のエージェントがいる場合、HP吸収の計算を行う
      for (let i = 0; i < cellAgents.length; i++) {
        for (let j = i + 1; j < cellAgents.length; j++) {
          const agentA = cellAgents[i];
          const agentB = cellAgents[j];

          // HP吸収量の計算
          const absorbA = agentA.atk - agentB.def;
          const absorbB = agentB.atk - agentA.def;

          // ダメージやり取りの累計に加算 (絶対値の合計)
          totalDamageExchanged += Math.abs(absorbA) + Math.abs(absorbB);

          // HPの更新 (一時変数に格納して同時に更新されたかのように扱う)
          const nextHpA = agentA.hp + absorbA;
          const nextHpB = agentB.hp + absorbB;

          agentA.hp = nextHpA;
          agentB.hp = nextHpB;
        }
      }
    }
    // HPが0より大きいエージェントを最終リストに追加し、死亡数をカウント
    cellAgents.forEach(agent => {
      if (agent.hp > 0) {
        finalAgents.push(agent);
      } else {
        totalDeathsByInteraction++; // HPが0以下になったエージェントをカウント
      }
    });
  });

  // 次のステップのエージェントリストに新しいエージェントを追加し、HPが0以下のエージェントを除外
  agents = [...finalAgents, ...newAgents];
}

// シミュレーションのステップを実行するAPIルート
export async function GET() {
  moveAgents(); // エージェントを移動させる
  return NextResponse.json({ agents: agents, totalDamageExchanged: totalDamageExchanged, totalDeathsByInteraction: totalDeathsByInteraction });
}