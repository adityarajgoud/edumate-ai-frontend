import { useState, useEffect, useRef } from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { postToBackend } from "@/lib/api";

export const Roadmap = () => {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const { setRoadmapData, setSelectedTrack } = useRoadmap();
  const { toast } = useToast();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedRoadmap = localStorage.getItem("roadmapData");
    const savedTrack = localStorage.getItem("selectedTrack");

    if (savedRoadmap && savedTrack) {
      const parsed = JSON.parse(savedRoadmap);
      setRoadmap(parsed);
      setGoal(savedTrack);
      setRoadmapData(parsed);
      setSelectedTrack(savedTrack);
    }
  }, []);

  useEffect(() => {
    inputRef.current?.focus(); // Autofocus input
  }, []);

  const generateRoadmap = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError("");

    try {
      const data = await postToBackend("/api/roadmap", { goal });
      setRoadmap(data);
    } catch (err: any) {
      console.error("❌ Backend error:", err);
      setError("❌ Failed to generate roadmap. Please try again.");
    }

    setLoading(false);
  };

  const handleSelectAsGoal = () => {
    if (!roadmap.length) return;

    setRoadmapData(roadmap);
    setSelectedTrack(goal);

    localStorage.setItem("roadmapData", JSON.stringify(roadmap));
    localStorage.setItem("selectedTrack", goal);
    localStorage.removeItem("userTasks");

    const allTasks = roadmap.flatMap((week) =>
      week.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        category: week.title,
        time: "30",
        difficulty: "medium",
        completed: task.completed || false,
      }))
    );

    localStorage.setItem("userTasks", JSON.stringify(allTasks));
    localStorage.setItem("streak", "0");
    localStorage.removeItem("streakData");

    toast({
      title: "🎉 Roadmap selected!",
      description: "Dashboard updated with AI-generated tasks.",
    });

    navigate("/");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      generateRoadmap();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Your Learning Roadmap</h1>
        <p className="text-muted-foreground">
          Generate a personalized roadmap based on your learning goal
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 max-w-xl mx-auto">
        <Input
          ref={inputRef}
          placeholder="e.g. Become a Cloud Engineer"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={generateRoadmap} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {error && <div className="text-red-500 text-center text-sm">{error}</div>}

      {roadmap.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <Button
              onClick={handleSelectAsGoal}
              disabled={loading}
              className="text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
            >
              ✅ Select as Your Goal
            </Button>
          </div>

          <div className="max-w-4xl mx-auto mt-6 space-y-8">
            {roadmap.map((week: any, index: number) => (
              <div key={week.week} className="relative flex gap-6">
                <div
                  className={cn(
                    "relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 bg-card",
                    week.completed
                      ? "border-success text-success"
                      : index === 0
                      ? "border-primary text-primary bg-primary/10"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  <span className="text-lg font-bold">{week.week}</span>
                </div>

                <Card
                  className={cn(
                    "flex-1 border-0 shadow-sm",
                    week.completed && "bg-success/5 border-success/20",
                    index === 0 &&
                      !week.completed &&
                      "ring-2 ring-primary/20 bg-primary/5"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{week.title}</CardTitle>
                      <Badge
                        variant={
                          week.completed
                            ? "default"
                            : index === 0
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {week.completed
                          ? "Completed"
                          : index === 0
                          ? "In Progress"
                          : "Upcoming"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {week.tasks.map((task: any) => (
                        <div key={task.id} className="flex items-center gap-2">
                          {task.completed ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              task.completed &&
                                "line-through text-muted-foreground"
                            )}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
