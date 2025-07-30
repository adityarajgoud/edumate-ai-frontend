// src/components/modals/GoalModal.tsx

import { useState } from "react";
import {
  Target,
  Code,
  Palette,
  Database,
  Smartphone,
  Globe,
  Brain,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRoadmap } from "@/context/RoadmapContext";
import { useNotifications } from "@/context/NotificationContext"; // ✅ NEW

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (track: string, goal: string) => void;
}

const tracks = [
  {
    id: "fullstack",
    title: "Full Stack Development",
    description: "Master both frontend and backend development",
    icon: Code,
    gradient: "from-blue-500 to-purple-600",
  },
  {
    id: "frontend",
    title: "Frontend Development",
    description: "Specialize in user interfaces and experiences",
    icon: Palette,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "backend",
    title: "Backend Development",
    description: "Focus on server-side logic and databases",
    icon: Database,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "mobile",
    title: "Mobile Development",
    description: "Build iOS and Android applications",
    icon: Smartphone,
    gradient: "from-orange-500 to-yellow-600",
  },
  {
    id: "web3",
    title: "Web3 & Blockchain",
    description: "Learn decentralized technologies",
    icon: Globe,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "ai",
    title: "AI & Machine Learning",
    description: "Dive into artificial intelligence",
    icon: Brain,
    gradient: "from-violet-500 to-purple-600",
  },
];

export const GoalModal = ({ isOpen, onClose, onSubmit }: GoalModalProps) => {
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setSelectedTrack, setRoadmapData } = useRoadmap();
  const { addNotification } = useNotifications(); // ✅ NEW

  const handleSubmit = async () => {
    const track = tracks.find((t) => t.id === selectedTrackId);
    const title = track?.title || selectedTrackId;
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      setError("❌ API key is missing. Check .env file.");
      return;
    }

    onSubmit(title, learningGoal);
    setSelectedTrack(title);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-sonnet",
          messages: [
            {
              role: "user",
              content: `Generate a week-wise learning roadmap in JSON format:
[
  {
    "week": 1,
    "title": "Module Title",
    "tasks": [
      { "id": "task-1", "title": "Learn topic 1", "completed": false }
    ]
  }
]
Strict JSON only. The goal is: ${learningGoal}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";

      const jsonStart = content.indexOf("[");
      const jsonEnd = content.lastIndexOf("]") + 1;
      const rawJson = content.slice(jsonStart, jsonEnd);

      let roadmap = JSON.parse(rawJson);

      roadmap = roadmap.map((week: any, weekIdx: number) => ({
        ...week,
        tasks: week.tasks.map((task: any, taskIdx: number) => ({
          id: task.id || `week-${weekIdx}-task-${taskIdx}`,
          title: task.title,
          completed: task.completed ?? false,
        })),
      }));

      // Save to localStorage + context
      setRoadmapData(roadmap);
      localStorage.setItem("selectedTrack", title);
      localStorage.setItem("roadmapData", JSON.stringify(roadmap));

      const allTasks = roadmap.flatMap((week: any) =>
        week.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          category: week.title,
          time: "30",
          difficulty: "medium",
          completed: task.completed,
        }))
      );
      localStorage.setItem("userTasks", JSON.stringify(allTasks));

      // ✅ Send notification
      addNotification({
        title: "🎯 Roadmap Set!",
        message: `Your new roadmap for \"${learningGoal}\" is ready.`,
      });

      onClose();
    } catch (err) {
      console.error("Failed to generate roadmap", err);
      setError("❌ Roadmap generation failed. Please try again.");
    } finally {
      setLoading(false);
      setSelectedTrackId("");
      setLearningGoal("");
    }
  };

  const isFormComplete = selectedTrackId && learningGoal.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Set Your Learning Goals
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose your track and describe your goal. AI will build a
            personalized roadmap.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Track Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Choose Your Learning Track
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map((track) => {
                const Icon = track.icon;
                return (
                  <Card
                    key={track.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-md border-2",
                      selectedTrackId === track.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-transparent hover:border-primary/30"
                    )}
                    onClick={() => setSelectedTrackId(track.id)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br",
                          track.gradient
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold">{track.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {track.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Goal Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Describe Your Learning Goal
            </h3>
            <Textarea
              placeholder="e.g., I want to learn backend with Node.js in 2 months, 3 hours/day."
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about your goal, time, and current skill level.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            disabled={!isFormComplete || loading}
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              "Generate AI Roadmap"
            )}
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
};
