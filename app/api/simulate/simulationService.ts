import { Agent } from '@/types/agent';

// グリッドのサイズ
const GRID_SIZE = 100;

// エージェントの初期状態
let agents: Agent[] = [];
let agentIdCounter = 0; // グローバルなエージェントIDカウンター
let totalDamageExchanged = 0; // ダメージやり取りの累計
let totalDeathsByInteraction = 0; // ダメージやり取りによる死亡数
let currentStep = 0; // 現在のシミュレーションステップ

// 初期エージェント生成
function initializeAgents() {
    agents = [];
    agentIdCounter = 0;
    totalDamageExchanged = 0;
    totalDeathsByInteraction = 0;
    currentStep = 0;
    for (let i = 0; i < 100; i++) {
        agents.push({
            id: `agent-${agentIdCounter++}`,
            hp: Math.floor(Math.random() * 81) + 20,
            atk: Math.floor(Math.random() * 101),
            def: Math.floor(Math.random() * 101),
            mov: Math.floor(Math.random() * 5) + 1,
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            createdAtStep: currentStep,
        });
    }
}

initializeAgents(); // 初期化

// 各ステップでの分裂確率
const SPLIT_PROBABILITY = 0.1;

function moveAgentsAndSimulateStep() {
    currentStep++; // シミュレーションステップをインクリメント
    const newAgents: Agent[] = [];
    const nextAgents: Agent[] = [];

    agents.forEach(agent => {
        let newHp = agent.hp - 1;
        const atkCost = Math.floor(agent.atk / 10);
        newHp -= atkCost;
        const defCost = Math.floor(agent.def / 30);
        newHp -= defCost;

        if (newHp <= 0) {
            return;
        }

        const direction = Math.floor(Math.random() * 8);
        let dx = 0;
        let dy = 0;
        switch (direction) {
            case 0: dy = -1; break;
            case 1: dy = 1; break;
            case 2: dx = -1; break;
            case 3: dx = 1; break;
            case 4: dx = -1; dy = -1; break;
            case 5: dx = 1; dy = -1; break;
            case 6: dx = -1; dy = 1; break;
            case 7: dx = 1; dy = 1; break;
        }

        const moveDistance = agent.mov;
        newHp -= Math.floor(moveDistance / 3);
        if (newHp <= 0) return;

        let newX = agent.x + dx * moveDistance;
        let newY = agent.y + dy * moveDistance;
        newX = Math.max(0, Math.min(GRID_SIZE - 1, newX));
        newY = Math.max(0, Math.min(GRID_SIZE - 1, newY));

        nextAgents.push({ ...agent, hp: newHp, x: newX, y: newY });

        if (Math.random() < SPLIT_PROBABILITY) {
            const newAgent: Agent = {
                id: `agent-${agentIdCounter++}`,
                hp: Math.floor(Math.random() * 21) + 80,
                atk: Math.floor(Math.random() * 101),
                def: Math.floor(Math.random() * 101),
                mov: agent.mov,
                x: agent.x,
                y: agent.y,
                createdAtStep: currentStep,
            };
            newAgents.push(newAgent);
        }
    });

    const agentsAfterInteraction: Agent[] = [...nextAgents];
    const processedPairs = new Set<string>();

    for (let i = 0; i < agentsAfterInteraction.length; i++) {
        for (let j = i + 1; j < agentsAfterInteraction.length; j++) {
            const agentA = agentsAfterInteraction[i];
            const agentB = agentsAfterInteraction[j];

            if (agentA.hp <= 0 || agentB.hp <= 0) continue;

            const distance = Math.max(Math.abs(agentA.x - agentB.x), Math.abs(agentA.y - agentB.y));
            const HIT_DISTANCE = 2;
            if (distance <= HIT_DISTANCE) {
                const pairKey = [agentA.id, agentB.id].sort().join('-');
                if (processedPairs.has(pairKey)) continue;

                const absorbA = agentA.atk - agentB.def;
                const absorbB = agentB.atk - agentA.def;
                totalDamageExchanged += Math.abs(absorbA) + Math.abs(absorbB);

                const totalAbsorb = Math.abs(absorbA) + Math.abs(absorbB);
                if (totalAbsorb > 0) {
                    const randomValue = Math.random() * totalAbsorb;
                    if (randomValue < Math.abs(absorbA)) {
                        agentA.hp += absorbA;
                        agentB.hp -= absorbA;
                        if (agentB.hp <= 0) totalDeathsByInteraction++;
                    } else {
                        agentB.hp += absorbB;
                        agentA.hp -= absorbB;
                        if (agentA.hp <= 0) totalDeathsByInteraction++;
                    }
                }

                agentA.hp = Math.min(agentA.hp, 100);
                agentB.hp = Math.min(agentB.hp, 100);
                processedPairs.add(pairKey);
            }
        }
    }

    const finalAgents = agentsAfterInteraction.filter(agent => {
        if (agent.hp <= 0) {
            // totalDeathsByInteraction++; // This was potentially double counting, as interaction deaths are already counted.
            return false;
        }
        return true;
    });

    agents = [...finalAgents, ...newAgents];
}

export function runSimulationStep() {
    moveAgentsAndSimulateStep();
    return { agents, totalDamageExchanged, totalDeathsByInteraction, currentStep };
}

export function resetSimulation() {
    initializeAgents();
    return { agents, totalDamageExchanged, totalDeathsByInteraction, currentStep };
}