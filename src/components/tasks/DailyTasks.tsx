import { useState, useEffect } from "react";
import { Clock, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRoadmap } from "@/context/RoadmapContext";
import { motion, AnimatePresence } from "framer-motion";

const difficultyColors = {
  easy: "bg-task-easy text-white",
  medium: "bg-task-medium text-white",
  hard: "bg-task-hard text-white",
};

interface Task {
  id: string;
  title: string;
  category: string;
  time: string;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  description?: string;
}

export const DailyTasks = () => {
  const { roadmapData } = useRoadmap();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  const generateDailyTasks = (source: any[]): Task[] => {
    const all = source.flatMap((week: any, weekIdx: number) =>
      week.tasks.map((task: any, i: number) => ({
        id: task.id || `w${weekIdx}-t${i}`,
        title: task.title,
        category: week.title,
        time: "30",
        difficulty: "medium",
        completed: false,
        description: task.description || "",
      }))
    );
    const shuffled = all.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storedDate = localStorage.getItem("dailyTasksDate");
    const storedTasks = localStorage.getItem("dailyTasks");
    const storedSourceHash = localStorage.getItem("dailyTasksSourceHash");

    let sourceRoadmap = roadmapData;
    if (!sourceRoadmap.length) {
      const fallback = localStorage.getItem("roadmapData");
      if (fallback) {
        try {
          sourceRoadmap = JSON.parse(fallback);
        } catch (err) {
          console.error("❌ Failed to parse fallback roadmapData:", err);
        }
      }
    }

    if (!sourceRoadmap.length) return;

    const firstTitle = sourceRoadmap[0]?.tasks[0]?.title || "";
    const currentSourceHash = `${sourceRoadmap.length}-${firstTitle}`;

    if (
      storedTasks &&
      storedDate === today &&
      storedSourceHash === currentSourceHash
    ) {
      setTasks(JSON.parse(storedTasks));
    } else {
      const newTasks = generateDailyTasks(sourceRoadmap);
      setTasks(newTasks);
      localStorage.setItem("dailyTasks", JSON.stringify(newTasks));
      localStorage.setItem("dailyTasksDate", today);
      localStorage.setItem("dailyTasksSourceHash", currentSourceHash);
    }
  }, [roadmapData]);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("dailyTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleTaskToggle = (id: string, completed: boolean) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed } : task
    );
    setTasks(updated);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      filterDifficulty === "all" || task.difficulty === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Today's Tasks</h1>
        <p className="text-muted-foreground">
          {completedCount}/{tasks.length} completed today
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {["all", "easy", "medium", "hard"].map((level) => (
                <Button
                  key={level}
                  variant={filterDifficulty === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterDifficulty(level)}
                  className={cn(
                    "transition-all duration-200",
                    filterDifficulty === level &&
                      level !== "all" &&
                      difficultyColors[level as keyof typeof difficultyColors]
                  )}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={cn(
                  "border-0 shadow-sm transition-all hover:shadow-md",
                  task.completed && "bg-muted/30"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className="mt-1"
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => {
                          if (typeof checked === "boolean") {
                            handleTaskToggle(task.id, checked);
                          }
                        }}
                      />
                    </motion.div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3
                          className={cn(
                            "font-semibold text-lg",
                            task.completed &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </h3>
                        <Badge
                          className={cn(
                            "text-xs",
                            difficultyColors[task.difficulty]
                          )}
                        >
                          {task.difficulty}
                        </Badge>
                      </div>

                      <p
                        className={cn(
                          "text-muted-foreground text-sm",
                          task.completed && "line-through"
                        )}
                      >
                        {task.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium">{task.category}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{task.time} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No tasks found matching your criteria.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
