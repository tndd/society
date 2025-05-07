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

for (let i = 0; i < 100; i++) { // 初期エージェント数を10体に修正
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

// 各ステップでの分裂確率
const SPLIT_PROBABILITY = 0.1;

function moveAgents() {
  const newAgents: Agent[] = [];
  const nextAgents: Agent[] = [];

  agents.forEach(agent => {
    // HPを1減らす
    let newHp = agent.hp - 1;

    // atkの維持コストを計算しHPから減算
    const atkCost = Math.floor(agent.atk / 10);
    newHp -= atkCost;

    // defの維持コストを計算しHPから減算
    const defCost = Math.floor(agent.def / 30);
    newHp -= defCost;

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

  // 3マス以内の当たり判定とHP吸収の計算
  const agentsAfterInteraction: Agent[] = [...nextAgents]; // 相互作用後のエージェントリスト（初期値は移動後のエージェントリスト）
  const processedPairs = new Set<string>(); // 処理済みのエージェントペアを記録するためのセット

  for (let i = 0; i < agentsAfterInteraction.length; i++) {
    for (let j = i + 1; j < agentsAfterInteraction.length; j++) {
      const agentA = agentsAfterInteraction[i];
      const agentB = agentsAfterInteraction[j];

      // 既に処理済みのペアか、どちらかが既に死亡している場合はスキップ
      if (agentA.hp <= 0 || agentB.hp <= 0) continue;

      // 距離の計算 (チェス盤距離)
      const distance = Math.max(Math.abs(agentA.x - agentB.x), Math.abs(agentA.y - agentB.y));

      // 3マス以内であればHP吸収の計算を行う
      if (distance <= 3) {
        // ペアのIDをソートしてキーを生成し、処理済みかチェック
        const pairKey = [agentA.id, agentB.id].sort().join('-');
        if (processedPairs.has(pairKey)) continue;

        // HP吸収量の計算
        const absorbA = agentA.atk - agentB.def;
        const absorbB = agentB.atk - agentA.def;

        // ダメージやり取りの累計に加算 (絶対値の合計)
        totalDamageExchanged += Math.abs(absorbA) + Math.abs(absorbB);

        // HPの更新 (確率的な増減)
        const totalAbsorb = Math.abs(absorbA) + Math.abs(absorbB);
        if (totalAbsorb > 0) {
          const randomValue = Math.random() * totalAbsorb;
          if (randomValue < Math.abs(absorbA)) {
            // AがHPを獲得し、BがHPを失う
            agentA.hp += absorbA;
            agentB.hp -= absorbA; // BはAが獲得した分と同じだけ失う
          } else {
            // BがHPを獲得し、AがHPを失う
            agentB.hp += absorbB;
            agentA.hp -= absorbB; // AはBが獲得した分と同じだけ失う
          }
        }

        // HPの上限を100に設定
        agentA.hp = Math.min(agentA.hp, 100);
        agentB.hp = Math.min(agentB.hp, 100);

        // 処理済みペアとして記録
        processedPairs.add(pairKey);
      }
    }
  }

  // HPが0以下のエージェントをフィルタリングし、死亡数をカウント
  const finalAgents = agentsAfterInteraction.filter(agent => {
    if (agent.hp <= 0) {
      totalDeathsByInteraction++; // HPが0以下になったエージェントをカウント
      return false; // リストから除外
    }
    return true; // リストに残す
  });

  // 次のステップのエージェントリストに新しいエージェントを追加
  agents = [...finalAgents, ...newAgents];
}

// シミュレーションのステップを実行するAPIルート
export async function GET() {
  moveAgents(); // エージェントを移動させる
  return NextResponse.json({ agents: agents, totalDamageExchanged: totalDamageExchanged, totalDeathsByInteraction: totalDeathsByInteraction });
}