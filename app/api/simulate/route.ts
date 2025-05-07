import { NextResponse } from 'next/server';
import { resetSimulation, runSimulationStep } from './simulationService';

// シミュレーションのステップを実行するAPIルート
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'reset') {
    const simulationData = resetSimulation();
    return NextResponse.json(simulationData);
  }

  const simulationData = runSimulationStep();
  return NextResponse.json(simulationData);
}