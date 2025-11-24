import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainMenu } from "./pages/MainMenu";
import { GameScreen } from "./pages/GameScreen";
import { StakingScreen } from "./pages/StakingScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/staking" element={<StakingScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

