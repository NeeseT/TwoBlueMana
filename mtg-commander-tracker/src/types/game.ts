export interface Player {
  id: string;
  name: string;
  createdAt: Date;
}

export interface GameResult {
  id: string;
  gameId: string;
  playerId: string;
  placement: number;
  commander: string;
  colors: string;
}

export interface Game {
  id: string;
  date: Date;
  duration?: number;
  results: GameResult[];
}
