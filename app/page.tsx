"use client";

import { useEffect, useState } from 'react';

// エージェントのデータ構造 (バックエンドと合わせる)
import SimulationGrid from '@/components/SimulationGrid';
import TopAgentsDisplay from '@/components/TopAgentsDisplay';
import { Agent } from '@/types/agent';

// シミュレーションデータの構造 (バックエンドと合わせる)
interface SimulationData {
  agents: Agent[];
  totalDamageExchanged: number;
  totalDeathsByInteraction: number; // ダメージやり取りによる死亡数
  currentStep: number; // 現在のシミュレーションステップ
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalDamage, setTotalDamage] = useState<number>(0); // ダメージ累計
  const [deathsByInteraction, setDeathsByInteraction] = useState<number>(0); // ダメージやり取りによる死亡数
  const [currentStep, setCurrentStep] = useState<number>(0); // 現在のシミュレーションステップ

  useEffect(() => {
    const fetchAgents = async () => {
      const res = await fetch('/api/simulate');
      const data: SimulationData = await res.json();
      setAgents(data.agents);
      setTotalDamage(data.totalDamageExchanged);
      setDeathsByInteraction(data.totalDeathsByInteraction);
      setCurrentStep(data.currentStep);
    };

    // 初回フェッチ
    fetchAgents();

    // 一定間隔でフェッチ (例: 500msごと)
    const intervalId = setInterval(fetchAgents, 500);

    // クリーンアップ関数
    return () => clearInterval(intervalId);
  }, []); // 空の依存配列でマウント時に一度だけ実行

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      {/* 情報表示コンテナ */}
      <div>
        {/* ダメージ累計表示 */}
        <div className="mb-4 text-lg font-bold text-black">
          ダメージ累計: {totalDamage}
        </div>

        {/* 戦死数表示 */}
        <div className="mb-4 text-lg font-bold text-black">
          戦死数: {deathsByInteraction}
        </div>
      </div>

      {/* 上位エージェント情報表示コンテナ */}
      <TopAgentsDisplay agents={agents} currentStep={currentStep} />

      {/* グリッドコンテナ */}
      <SimulationGrid agents={agents} />
    </div>
  );
}
