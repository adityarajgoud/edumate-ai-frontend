import { useState } from "react";
import { Clock, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: string;
  title: string;
  category: string;
  time: string;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
}

interface TaskPreviewProps {
  tasks: Task[];
  onTaskToggle: (id: string, completed: boolean) => void;
}

const difficultyColors = {
  easy: "bg-green-500 text-white",
  medium: "bg-yellow-500 text-white",
  hard: "bg-red-500 text-white",
};

export const TaskPreview = ({ tasks, onTaskToggle }: TaskPreviewProps) => {
  const [expanded, setExpanded] = useState(false);
  const { addNotification } = useNotifications();
  const previewCount = 3;

  const visibleTasks = expanded ? tasks : tasks.slice(0, previewCount);
  const remaining = tasks.length - previewCount;

  const handleToggle = (task: Task, checked: boolean) => {
    onTaskToggle(task.id, checked);

    addNotification({
      title: checked ? "✅ Task Completed" : "🔁 Task Incomplete",
      message: `"${task.title}" was ${
        checked ? "marked as done" : "marked incomplete"
      }.`,
    });
  };

  return (
    <Card className="border-0 shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <CheckSquare className="h-5 w-5" />
          Today's Tasks
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence>
          {visibleTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border shadow-sm transition-all duration-200",
                task.completed
                  ? "bg-muted/60 opacity-80 line-through"
                  : "bg-white dark:bg-slate-800 hover:bg-accent/40"
              )}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) =>
                  handleToggle(task, checked === true)
                }
              />

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      "font-semibold text-sm",
                      task.completed && "text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </h4>
                  <Badge
                    className={cn(
                      "text-xs capitalize",
                      difficultyColors[task.difficulty]
                    )}
                  >
                    {task.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{task.category}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.time} min
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {remaining > 0 && (
          <div className="text-center pt-2">
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="text-sm text-muted-foreground hover:underline hover:text-primary transition"
            >
              {expanded ? "Show less ▲" : `+${remaining} more tasks ▼`}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
