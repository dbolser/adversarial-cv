export enum GameStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS', // Passed the level
  FAILURE = 'FAILURE', // Failed the level
  GAME_OVER = 'GAME_OVER' // Beat all levels
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  systemInstruction: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface HRResponse {
  score: number;
  summary: string;
  feedback: string;
}

export interface GameState {
  currentLevel: number;
  status: GameStatus;
  cvText: string;
  history: Array<{ level: number; input: string; response: HRResponse }>;
}