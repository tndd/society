export interface Agent {
  id: string;
  hp: number;
  atk: number;
  def: number;
  mov: number;
  x: number;
  y: number;
  createdAtStep: number; // エージェントが生成されたステップ
}