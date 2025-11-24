import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainMenu } from "./pages/MainMenu";
import { ClickerScreen } from "./pages/ClickerScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/clicker" element={<ClickerScreen />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

