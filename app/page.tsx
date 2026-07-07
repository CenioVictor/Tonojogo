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

  useEffect(() => {
    if (gameState && gameState.gameActive && gameStarted) {
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

  if (!gameState) return <div className="text-white">Carregando...</div>;

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
      <div className="flex justify-between mb-6 text-white">
        <div className="text-center flex-1">
          <p className="text-sm opacity-75">DUPLA 1</p>
          <p className="text-4xl font-bold">{gameState.roundScore[0]}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-2xl font-bold">VS</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-sm opacity-75">DUPLA 2</p>
          <p className="text-4xl font-bold">{gameState.roundScore[1]}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
        <p className="text-lg font-bold text-gray-800">
          Turno: <span className="text-green-600">{currentPlayer.name}</span>
        </p>
        <p className="text-sm text-gray-600">Peças no Monte: {gameState.pile.length}</p>
        {gameState.closedGame && <p className="text-red-600 font-bold">🔒 JOGO FECHADO!</p>}
      </div>

      <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6 flex justify-center items-center min-h-32">
        <div className="flex gap-2 flex-wrap justify-center">
          {gameState.board.length === 0 ? (
            <p className="text-white text-2xl opacity-50">Tabuleiro Vazio</p>
          ) : (
            gameState.board.map((piece, idx) => (
              <div key={idx} className="bg-yellow-600 text-white rounded-lg p-3 shadow-lg font-bold text-center">
                <div className="text-lg">{piece.left}</div>
                <div className="border-t-2 border-yellow-400 my-1"></div>
                <div className="text-lg">{piece.right}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {!canMove && !gameState.gameOver && (
        <div className="bg-yellow-400 text-gray-800 p-4 rounded-lg mb-4 text-center font-bold">
          ✋ Turno Encerrado - Clique em "Próxima Rodada"
        </div>
      )}

      {gameState.gameOver && (
        <div className="bg-green-400 text-white p-4 rounded-lg mb-4 text-center font-bold">
          🏆 JOGO FINALIZADO! Dupla {gameState.finalScore[0] > gameState.finalScore[1] ? 1 : 2} Venceu!
        </div>
      )}

      <div className="bg-white rounded-lg p-4 mb-6">
        <p className="text-sm font-bold text-gray-600 mb-3">SUAS PEÇAS ({currentPlayer.pieces.length})</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {currentPlayer.pieces.map((piece) => (
            <button
              key={piece.id}
              onClick={() => {
                if (playableCards.some((p) => p.id === piece.id)) {
                  handlePlayPiece(piece);
                }
              }}
              disabled={!playableCards.some((p) => p.id === piece.id) || !canMove}
              className={`p-3 rounded-lg font-bold text-center transition ${
                playableCards.some((p) => p.id === piece.id) && canMove
                  ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-lg">{piece.left}</div>
              <div className="border-t border-current my-1"></div>
              <div className="text-lg">{piece.right}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={handleDraw} disabled={!canMove} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition">
          📥 Comprar do Monte
        </button>
        {!gameState.gameActive && (
          <button onClick={handleNewRound} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition">
            ➡️ {gameState.gameOver ? 'Fim' : 'Próxima'}
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {gameState.players.filter((_, idx) => idx !== gameState.currentPlayerIndex).map((player) => (
          <div key={player.id} className="rounded-lg p-4 bg-gray-600 text-white">
            <p className="font-bold">{player.name}</p>
            <p className="text-2xl font-bold">{player.pieces.length}</p>
            <p className="text-xs opacity-75">peças</p>
          </div>
        ))}
      </div>
    </div>
  );
}
