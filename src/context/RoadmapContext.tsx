import { createContext, useContext, useEffect, useState } from "react";
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Week {
  week: number;
  title: string;
  completed: boolean;
  tasks: Task[];
}

interface RoadmapContextType {
  selectedTrack: string;
  setSelectedTrack: (track: string) => void;
  roadmapData: Week[];
  setRoadmapData: (data: Week[]) => void;
}

const RoadmapContext = createContext<RoadmapContextType | null>(null);

const RoadmapProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [roadmapData, setRoadmapData] = useState<Week[]>([]);

  useEffect(() => {
    const savedTrack = localStorage.getItem("selectedTrack");
    const savedRoadmap = localStorage.getItem("roadmapData");
    const savedTasks = localStorage.getItem("userTasks");

    if (savedTrack) setSelectedTrack(savedTrack);

    if (savedRoadmap) {
      try {
        const parsed = JSON.parse(savedRoadmap);
        if (Array.isArray(parsed)) {
          setRoadmapData(parsed);
        }
      } catch (err) {
        console.error("❌ Invalid roadmapData in localStorage", err);
      }
    } else if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) {
          const grouped: Week[] = [];

          for (let i = 0; i < parsedTasks.length; i += 5) {
            const weekNum = Math.floor(i / 5) + 1;
            const weekTasks = parsedTasks
              .slice(i, i + 5)
              .map((task: any, idx: number) => ({
                id: task.id || `week-${weekNum}-task-${idx}`,
                title: task.title,
                completed: Boolean(task.completed),
              }));

            grouped.push({
              week: weekNum,
              title: `Week ${weekNum}`,
              completed: false,
              tasks: weekTasks,
            });
          }

          setRoadmapData(grouped);
          localStorage.setItem("roadmapData", JSON.stringify(grouped));
        }
      } catch (err) {
        console.error("❌ Invalid userTasks in localStorage", err);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedTrack) {
      localStorage.setItem("selectedTrack", selectedTrack);
    }

    if (roadmapData.length > 0) {
      localStorage.setItem("roadmapData", JSON.stringify(roadmapData));
    }
  }, [selectedTrack, roadmapData]);

  return (
    <RoadmapContext.Provider
      value={{ selectedTrack, setSelectedTrack, roadmapData, setRoadmapData }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

const useRoadmap = (): RoadmapContextType => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error("useRoadmap must be used within a RoadmapProvider");
  }
  return context;
};

export { RoadmapProvider, useRoadmap };
