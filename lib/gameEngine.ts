import { Piece, Player, GameState, BeatType } from "./types";

// Criar todas as 28 peças de dominó
export function createDominos(): Piece[] {
  const pieces: Piece[] = [];
  let id = 0;
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      pieces.push({
        left: i,
        right: j,
        id: `piece-${id++}`,
      });
    }
  }
  return pieces;
}

// Embaralhar array
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Inicializar novo jogo
export function initializeGame(playerNames: string[]): GameState {
  const shuffled = shuffle(createDominos());
  const pieces = shuffled.slice(0, 24); // 6 x 4 jogadores
  const pile = shuffled.slice(24); // Sobram 4 peças

  const players: Player[] = playerNames.map((name, idx) => ({
    id: `player-${idx}`,
    name,
    pieces: pieces.slice(idx * 6, (idx + 1) * 6),
    team: idx % 2 === 0 ? 0 : 1,
  }));

  // Encontrar quem tem [6|6]
  let startPlayer = 0;
  for (let i = 0; i < players.length; i++) {
    if (players[i].pieces.some((p) => p.left === 6 && p.right === 6)) {
      startPlayer = i;
      break;
    }
  }

  return {
    players,
    board: [],
    currentPlayerIndex: startPlayer,
    gameActive: true,
    roundScore: [0, 0],
    finalScore: [0, 0],
    pile,
    lastWinner: null,
    lastBeatType: null,
    passCount: 0,
    gameOver: false,
    closedGame: false,
  };
}

// Verificar se uma peça pode ser colocada
export function canPlayPiece(piece: Piece, board: Piece[]): boolean {
  if (board.length === 0) return true;

  const left = board[0];
  const right = board[board.length - 1];

  return piece.left === left.left || piece.right === right.right ||
    piece.left === right.right || piece.right === left.left;
}

// Colocar peça no tabuleiro
export function playPiece(
  state: GameState,
  piece: Piece,
  side: "left" | "right"
): GameState {
  const newState = { ...state };
  const player = newState.players[newState.currentPlayerIndex];

  // Remove piece from player
  player.pieces = player.pieces.filter((p) => p.id !== piece.id);

  // Add to board (maintain orientation)
  if (newState.board.length === 0) {
    newState.board = [piece];
  } else {
    const newPiece = { ...piece };
    const boardRight = newState.board[newState.board.length - 1];

    if (side === "right") {
      if (newPiece.left !== boardRight.right) {
        newPiece.left = newPiece.right;
        newPiece.right = boardRight.right === newPiece.left ? newPiece.right : newPiece.left;
      }
      newState.board.push(newPiece);
    } else {
      const boardLeft = newState.board[0];
      if (newPiece.right !== boardLeft.left) {
        let temp = newPiece.left;
        newPiece.left = newPiece.right;
        newPiece.right = temp;
      }
      newState.board.unshift(newPiece);
    }
  }

  // Verificar vitória
  if (player.pieces.length === 0) {
    newState.gameActive = false;
    return newState;
  }

  // Próximo jogador
  newState.passCount = 0;
  newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % 4;

  return newState;
}

// Comprar do monte
export function drawFromPile(state: GameState): GameState {
  const newState = { ...state };
  const player = newState.players[newState.currentPlayerIndex];

  if (newState.pile.length > 0) {
    player.pieces.push(newState.pile.pop()!);
    newState.passCount = 0;
  } else {
    newState.passCount++;
  }

  // Se 4 passaram seguidos, jogo fecha
  if (newState.passCount >= 4) {
    newState.closedGame = true;
    newState.gameActive = false;
  } else {
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % 4;
  }

  return newState;
}

// Detectar tipo de batida
export function detectBeatType(board: Piece[]): BeatType {
  if (board.length === 0) return null;

  const left = board[0];
  const right = board[board.length - 1];

  // Cruzada (carroça nas duas pontas)
  if (left.left === left.right && right.left === right.right) {
    return "cruzada";
  }

  // Lá é lo (mesmo número nas duas pontas)
  if (left.left === right.right) {
    return "laelo";
  }

  // Carroça (um dos lados é carroça)
  if (left.left === left.right || right.left === right.right) {
    return "carroça";
  }

  return "normal";
}

// Calcular pontos baseado no tipo de batida
export function calculatePoints(beatType: BeatType, currentScore: number): number {
  switch (beatType) {
    case "normal":
      return currentScore + 1;
    case "carroça":
      return currentScore + 2;
    case "laelo":
      return currentScore + 3;
    case "cruzada":
      return currentScore + 4;
    default:
      return currentScore;
  }
}

// Calcular pontos do jogo fechado
export function calculateClosedGamePoints(
  players: Player[]
): [number, number] {
  const team0Points = players
    .filter((p) => p.team === 0)
    .reduce((sum, p) => sum + p.pieces.reduce((s, pc) => s + pc.left + pc.right, 0), 0);

  const team1Points = players
    .filter((p) => p.team === 1)
    .reduce((sum, p) => sum + p.pieces.reduce((s, pc) => s + pc.left + pc.right, 0), 0);

  return [team0Points, team1Points];
}

// Encontrar menor pedra da dupla
export function getSmallestPiece(player: Player): number {
  return Math.min(...player.pieces.map((p) => p.left + p.right));
}

// Finalizar rodada
export function endRound(state: GameState, beatType: BeatType): GameState {
  const newState = { ...state };
  const currentPlayer = newState.players[newState.currentPlayerIndex];
  const winnerTeam = currentPlayer.team;

  let points = 0;

  if (newState.closedGame) {
    // Jogo fechado - quem tem menor pedra ganha
    const [team0, team1] = calculateClosedGamePoints(newState.players);
    points = team0 > team1 ? 1 : team1 > team0 ? 1 : 1;

    // Find player with smallest piece in winning team
    const teamPlayers = newState.players.filter((p) => p.team === winnerTeam);
    const smallestPlayer = teamPlayers.reduce((prev, curr) =>
      getSmallestPiece(curr) < getSmallestPiece(prev) ? curr : prev
    );
    newState.lastWinner = smallestPlayer.id;
  } else {
    // Jogo normal - contar pontos dos adversários
    const losingPlayers = newState.players.filter((p) => p.team !== winnerTeam);
    points = losingPlayers.reduce(
      (sum, p) => sum + p.pieces.reduce((s, pc) => s + pc.left + pc.right, 0),
      0
    );
    newState.lastWinner = currentPlayer.id;
  }

  // Calcular pontos com multiplicador
  points = calculatePoints(beatType, 0);
  newState.lastBeatType = beatType;

  // Atualizar score
  if (winnerTeam === 0) {
    newState.roundScore[0] += points;
  } else {
    newState.roundScore[1] += points;
  }

  // Verificar vitória
  const maxScore = Math.max(newState.roundScore[0], newState.roundScore[1]);
  if (maxScore >= 6) {
    if (maxScore === 5 && newState.roundScore[0] === 5 && newState.roundScore[1] === 5) {
      // Jogo vai pra 7
    } else if (maxScore >= 6) {
      newState.finalScore = [...newState.roundScore];
      newState.gameOver = true;
    }
  }

  return newState;
}

// Iniciar nova rodada
export function startNewRound(state: GameState): GameState {
  const shuffled = shuffle(createDominos());
  const pieces = shuffled.slice(0, 24);
  const pile = shuffled.slice(24);

  // Quem ganhou sai o próximo jogo (escolhe a peça)
  let startPlayerIndex = state.players.findIndex((p) => p.id === state.lastWinner);
  if (startPlayerIndex === -1) startPlayerIndex = 0;

  const newState: GameState = {
    players: state.players.map((player, idx) => ({
      ...player,
      pieces: pieces.slice(idx * 6, (idx + 1) * 6),
    })),
    board: [],
    currentPlayerIndex: startPlayerIndex,
    gameActive: true,
    roundScore: state.roundScore,
    finalScore: state.finalScore,
    pile,
    lastWinner: null,
    lastBeatType: null,
    passCount: 0,
    gameOver: false,
    closedGame: false,
  };

  return newState;
}
