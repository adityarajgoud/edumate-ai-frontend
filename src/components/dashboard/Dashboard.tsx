import { useEffect, useState } from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { CheckCircle, Flame, Clock, TrendingUp } from "lucide-react";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskPreview } from "@/components/dashboard/TaskPreview";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

export const Dashboard = () => {
  const { selectedTrack, roadmapData, setRoadmapData } = useRoadmap();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [tasks, setTasks] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // --- STREAK CHECK ---
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastVisit = localStorage.getItem("lastVisitDate");
    const storedStreakData = localStorage.getItem("streakData");
    let streakData: string[] = storedStreakData
      ? JSON.parse(storedStreakData)
      : [];

    if (lastVisit === today) {
      setStreak(streakData.length);
      return;
    }

    if (!lastVisit) {
      streakData = [];
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastVisit === yesterdayStr) {
        streakData.push(today);
        addNotification({
          title: "🔥 Streak Continued!",
          message: `You're on a ${streakData.length}-day streak. Keep going!`,
        });
      } else {
        streakData = [];
      }
    }

    localStorage.setItem("lastVisitDate", today);
    localStorage.setItem("streakData", JSON.stringify(streakData));
    setStreak(streakData.length);
  }, []);

  // --- TASK INIT ---
  useEffect(() => {
    const onboarded = localStorage.getItem("isOnboarded");
    if (!selectedTrack || roadmapData.length === 0) {
      if (!onboarded) {
        setShowModal(true);
      }
      return;
    } else {
      localStorage.setItem("isOnboarded", "true");
    }

    const storedUserTasks = localStorage.getItem("userTasks");
    const storedDailyTasks = localStorage.getItem("dailyTasks");

    const generateTaskId = (task: any, weekIndex: number, i: number) =>
      task.id || `week-${weekIndex}-task-${i}`;

    if (storedUserTasks) {
      const parsedTasks = JSON.parse(storedUserTasks);
      const fixedTasks = parsedTasks.map((task: any, i: number) => ({
        ...task,
        id: task.id || `fixed-task-${i}`,
      }));
      setTasks(fixedTasks);
    } else if (storedDailyTasks) {
      const daily = JSON.parse(storedDailyTasks);
      const fixedDaily = daily.map((task: any, i: number) => ({
        ...task,
        id: task.id || `daily-${i}`,
      }));
      setTasks(fixedDaily);
      localStorage.setItem("userTasks", JSON.stringify(fixedDaily));
    } else {
      const generatedTasks = roadmapData.flatMap(
        (week: any, weekIndex: number) =>
          week.tasks.map((task: any, i: number) => ({
            id: generateTaskId(task, weekIndex, i),
            title: task.title,
            category: week.title,
            time: "30",
            difficulty: "medium",
            completed: task.completed || false,
          }))
      );
      setTasks(generatedTasks);
      localStorage.setItem("userTasks", JSON.stringify(generatedTasks));
    }

    setInitialized(true);
  }, [roadmapData, selectedTrack]);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem("userTasks", JSON.stringify(tasks));
    }
  }, [tasks, initialized]);

  const handleTaskToggle = (id: string, completed: boolean) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed } : task
    );
    setTasks(updatedTasks);

    const updatedRoadmap = roadmapData.map((week, weekIndex) => ({
      ...week,
      tasks: week.tasks.map((task, i) => {
        const taskId = task.id || `week-${weekIndex}-task-${i}`;
        return taskId === id ? { ...task, completed } : task;
      }),
    }));

    setRoadmapData(updatedRoadmap);
    localStorage.setItem("userTasks", JSON.stringify(updatedTasks));
    localStorage.setItem("roadmapData", JSON.stringify(updatedRoadmap));
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalHours =
    tasks.reduce((sum, task) => sum + parseInt(task.time || "0"), 0) / 60;
  const completionPercent = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  return (
    <>
      {/* Onboarding Modal */}
      <Dialog open={showModal}>
        <DialogContent className="text-center animate-fadeIn rounded-xl shadow-xl border bg-gradient-to-br from-slate-900 to-slate-800 text-white max-w-sm mx-auto">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <DialogTitle className="text-2xl font-bold text-white">
                🎓 Welcome to EduMate AI!
              </DialogTitle>
              <DialogDescription className="text-base mt-3 text-slate-300 leading-relaxed">
                Before you begin your journey, please select a learning roadmap
                to get the most personalized experience.
              </DialogDescription>
              <button
                onClick={() => navigate("/roadmap")}
                className="mt-6 w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all duration-200 shadow-md"
              >
                🚀 Choose Your Roadmap
              </button>
              <p className="text-xs mt-4 text-muted-foreground">
                You’ll only see this once.
              </p>
            </motion.div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Main Dashboard */}
      {initialized && selectedTrack && roadmapData.length > 0 && (
        <motion.div
          className="space-y-6 relative w-full max-w-full px-4 sm:px-6 md:px-8 mx-auto overflow-x-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <HeroSection
            hasTrack={true}
            onSetGoals={() => {}}
            currentTrack={selectedTrack}
            progress={completionPercent}
            streak={streak}
            onChangeRoadmapClick={() => navigate("/roadmap")}
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            <StatCard
              icon={<CheckCircle className="h-6 w-6 text-success" />}
              title="Tasks Completed"
              value={completedTasks}
              subtitle="This week"
              trend="+12% from last week"
            />
            <StatCard
              icon={<Flame className="h-6 w-6 text-orange-500" />}
              title="Learning Streak"
              value={`${streak} days`}
              subtitle="Keep it up!"
            />
            <StatCard
              icon={<Clock className="h-6 w-6 text-info" />}
              title="Total Hours"
              value={totalHours.toFixed(1)}
              subtitle="This month"
              trend="+3.2 hours this week"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6 text-primary" />}
              title="Completion"
              value={`${completionPercent}%`}
              subtitle="Overall progress"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <TaskPreview tasks={tasks} onTaskToggle={handleTaskToggle} />
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
