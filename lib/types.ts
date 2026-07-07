// Tipos para o jogo de Dominó em Duplas

export type Piece = {
  left: number;
  right: number;
  id: string;
};

export type Player = {
  id: string;
  name: string;
  pieces: Piece[];
  team: 0 | 1; // 0 = Dupla 1, 1 = Dupla 2
};

export type GameState = {
  players: Player[];
  board: Piece[];
  currentPlayerIndex: number;
  gameActive: boolean;
  roundScore: [number, number]; // [Dupla 1, Dupla 2]
  finalScore: [number, number]; // [Dupla 1, Dupla 2]
  pile: Piece[];
  lastWinner: number | null; // ID do jogador que ganhou última partida
  lastBeatType: BeatType | null;
  passCount: number;
  gameOver: boolean;
  closedGame: boolean; // Jogo fechado (ninguém pode comprar)
};

export type BeatType = "normal" | "carroça" | "laelo" | "cruzada" | null;

export type GameHistory = {
  id: string;
  players: string[];
  finalScore: [number, number];
  rounds: RoundHistory[];
  createdAt: Date;
};

export type RoundHistory = {
  roundNumber: number;
  winner: string;
  winnerTeam: number;
  beatType: BeatType;
  points: number;
};
