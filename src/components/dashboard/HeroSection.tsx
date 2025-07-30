import { Target, TrendingUp, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface HeroSectionProps {
  hasTrack: boolean;
  onSetGoals: () => void;
  currentTrack?: string;
  progress?: number;
  streak?: number;
  onChangeRoadmapClick?: () => void;
}

export const HeroSection = ({
  hasTrack,
  onSetGoals,
  currentTrack,
  progress = 0,
  streak = 0,
  onChangeRoadmapClick,
}: HeroSectionProps) => {
  if (!hasTrack) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="border-0 bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <Target className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Welcome to EduMate AI!</h2>
              <p className="text-white/90 max-w-md mx-auto">
                Start your personalized learning journey today. Set your goals
                and let AI create the perfect roadmap for you.
              </p>
              <Button
                onClick={onSetGoals}
                variant="secondary"
                size="lg"
                className="mt-4 bg-white text-primary hover:bg-white/90 transition"
              >
                <Target className="h-4 w-4 mr-2" />
                Set Your Learning Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="border-0 bg-gradient-to-br from-primary to-purple-700 text-white shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Keep Learning!</h2>
              <p className="text-white/90">
                You're making great progress on your learning journey.
              </p>
              {currentTrack && (
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  {currentTrack}
                </Badge>
              )}
              {onChangeRoadmapClick && (
                <Button
                  onClick={onChangeRoadmapClick}
                  variant="secondary"
                  className="mt-4 bg-white text-gray-800 dark:bg-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 gap-2 transition"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Change Roadmap
                </Button>
              )}
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-4xl font-extrabold">{progress}%</div>
                <div className="text-sm text-white/80 mt-1">Progress</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold flex items-center gap-1">
                  {streak} <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-sm text-white/80 mt-1">Day Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
