"use client";

import { Agent } from '@/types/agent';

interface TopAgent extends Agent {
    survivalTime: number;
}

interface TopAgentsDisplayProps {
    agents: Agent[];
    currentStep: number;
}

const TopAgentsDisplay: React.FC<TopAgentsDisplayProps> = ({ agents, currentStep }) => {
    const topAgents: TopAgent[] = agents
        .map(agent => ({
            ...agent,
            survivalTime: currentStep - agent.createdAtStep,
        }))
        .sort((a, b) => b.survivalTime - a.survivalTime)
        .slice(0, 10);

    return (
        <div className="mb-8 p-4 border border-gray-400 rounded bg-white">
            <h2 className="text-xl font-bold mb-2 text-black">生存時間上位10エージェント</h2>
            {topAgents.map(agent => (
                <div key={agent.id} className="mb-1 text-sm text-gray-700">
                    ID: {agent.id}, HP: {agent.hp}, ATK: {agent.atk}, DEF: {agent.def}, MOV: {agent.mov}, 生存: {agent.survivalTime}ステップ
                </div>
            ))}
        </div>
    );
};

export default TopAgentsDisplay;