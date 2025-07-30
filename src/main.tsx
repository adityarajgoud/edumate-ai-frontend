// main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { RoadmapProvider } from "./context/RoadmapContext"; // ✅ Make sure the path is correct

createRoot(document.getElementById("root")!).render(
  <RoadmapProvider>
    <App />
  </RoadmapProvider>
);
