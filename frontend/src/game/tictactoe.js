import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./tictactoe.module.css";

export default function TicTacToe() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [mode, setMode] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const winner = calculateWinner(board);
  const isDraw = board.every(cell => cell) && !winner;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
      audioRef.current.volume = 0.08;
    }
  }, []);
  useEffect(() => {
    if (mode === "bot" && !xIsNext && !winner && !isDraw) {
      const timeout = setTimeout(() => {
        botMove();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [xIsNext, mode, board, winner, isDraw]);

  const handleClick = (index) => {
    if (board[index] || winner) return;
    if (mode === "bot" && !xIsNext) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const botMove = () => {
    const currentBoard = [...board];
    let move = findBestMove(currentBoard, "O");
    if (move === null) {
      move = findBestMove(currentBoard, "X");
    }
    if (move === null) {
      const emptyIndices = currentBoard.map((cell, idx) => cell ? null : idx).filter(val => val !== null);
      move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (move !== null) {
      currentBoard[move] = "O";
      setBoard(currentBoard);
      setXIsNext(true);
    }
  };

  const findBestMove = (squares, player) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
      const line = [squares[a], squares[b], squares[c]];
      if (line.filter(x => x === player).length === 2 && line.includes(null)) {
        if (!squares[a]) return a;
        if (!squares[b]) return b;
        if (!squares[c]) return c;
      }
    }
    return null;
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const goToBeach = () => {
    sessionStorage.setItem("skipIntroOnce", "true");
    sessionStorage.setItem("isBeach", "true");
    sessionStorage.setItem("startMusicAgain", "true");
    sessionStorage.setItem("changeBackgroundImage", "true");
    navigate("/");
  };

const backToGame = () => {
  setMode(null);
  setBoard(Array(9).fill(null));
  setXIsNext(true);
};

  return (
    <div className={styles.container}>
      <audio ref={audioRef} loop>
        <source src="/audio/findkeys.mp3" type="audio/mp3" />
      </audio>

      {!mode ? (
        <>
          <h1 className={styles.title}>Tic Tac Toe</h1>
          <button className={styles.resetButton} onClick={() => setMode("friend")}>Play with Friend</button>
          <button className={styles.resetButton} onClick={() => setMode("bot")}>Play with Bot</button>
          <button className={styles.backButton} onClick={goToBeach}>🔙 Back to Beach</button>
        </>
      ) : (
        <>
          <h1 className={styles.title}>Tic Tac Toe</h1>
          <div className={styles.status}>
            {winner
              ? `Winner: ${winner}`
              : isDraw
                ? "Draw!"
                : `Next player: ${xIsNext ? "X" : "O"}`}
          </div>

          <div className={styles.board}>
            {board.map((cell, idx) => (
         <div
  key={idx}
  className={`${styles.cell} ${cell ? styles.filled : ""}`}
  onClick={() => handleClick(idx)}
  style={{
    backgroundImage: 'url(/images/sand.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
>
  {cell && (
    <span style={{
      color: 'rgba(0, 0, 0, 0.7)',
      fontSize: '5rem'
    }}>
      {cell}
    </span>
  )}
</div>
            ))}
          </div>

          {(winner || isDraw) && (
            <button className={styles.resetButton} onClick={handleReset}>
              Play Again
            </button>
          )}

          <div className={styles.buttonContainer}>
            <button className={styles.backButton} onClick={backToGame}>🔙 Back to Main menu</button>
            <button className={styles.beachButton} onClick={goToBeach}>🏖️ Get back to Beach Walk</button>
          </div>
        </>
      )}
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
