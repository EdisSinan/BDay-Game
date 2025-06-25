import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./game/Game";
import AdminPanel from "./admin/adminPanel";
import FindTheKeys from "./game/findTheKeys";
import TicTacToe from "./game/tictactoe";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/findTheKeys" element={<FindTheKeys onComplete={() => window.location.href = "/"} />} />
        <Route path="/tictactoe" element={<TicTacToe onComplete={() => window.location.href = "/"} />} />
      </Routes>
    </Router>
  );
}
