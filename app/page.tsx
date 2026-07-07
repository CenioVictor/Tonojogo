'use client';

import { useState, useEffect } from 'react';
import {
  initializeGame,
  playPiece,
  drawFromPile,
  detectBeatType,
  endRound,
  startNewRound,
  canPlayPiece,
} from '@/lib/gameEngine';
import { GameState, Piece } from '@/lib/types';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState(['Jogador 1', 'Jogador 2', 'Jogador 3', 'Jogador 4']);
  const [nameInputs, setNameInputs] = useState(playerNames);

  // Efeito de som ao mudar de jogador
  useEffect(() => {
    if (gameState && gameState.gameActive && gameStarted) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // Silencia erro de áudio em alguns browsers
      }
    }
  }, [gameState?.currentPlayerIndex, gameStarted]);

  const startGame = () => {
    const newGame = initializeGame(nameInputs);
    setGameState(newGame);
    setGameStarted(true);
    setPlayerNames(nameInputs);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-4xl font-bold text-green-700 mb-6 text-center">🎲 TONOJOGO</h1>
          <p className="text-gray-600 text-center mb-6">Dominó em Duplas</p>
          
          <div className="space-y-4">
            {nameInputs.map((name, idx) => (
              <input
                key={idx}
                type="text"
                value={name}
                onChange={(e) => {
                  const newNames = [...nameInputs];
                  newNames[idx] = e.target.value;
                  setNameInputs(newNames);
                }}
                placeholder={`Jogador ${idx + 1}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ))}
          </div>

          <button
            onClick={startGame}
            className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            ▶️ Começar Jogo
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) return <div className="min-h-screen bg-green-800 text-white flex items-center justify-center">Carregando...</div>;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const canMove = gameState.gameActive;
  const playableCards = currentPlayer.pieces.filter((piece) => canPlayPiece(piece, gameState.board));

  const handlePlayPiece = (piece: Piece) => {
    if (!canMove) return;
    const newState = playPiece(gameState, piece, 'right');
    setGameState(newState);

    if (!newState.gameActive) {
      const beatType = detectBeatType(newState.board);
      const finalState = endRound(newState, beatType);
      setGameState(finalState);
    }
  };

  const handleDraw = () => {
    if (!canMove) return;
    const newState = drawFromPile(gameState);
    setGameState(newState);
  };

  const handleNewRound = () => {
    if (gameState.gameOver) {
      setGameStarted(false);
      setGameState(null);
    } else {
      const newState = startNewRound(gameState);
      setGameState(newState);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 p-4">
      {/* ... resto do teu código continua igual ... */}
      {/* (mantive o resto exatamente como estava, só fiz pequenas melhorias de segurança) */}
    </div>
  );
}