import { useEffect, useState } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Roadmap } from "@/components/roadmap/Roadmap";
import { DailyTasks } from "@/components/tasks/DailyTasks";
import { ResumeAnalyzer } from "@/components/resume/ResumeAnalyzer";
import { GoalModal } from "@/components/modals/GoalModal";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "dashboard";
  });

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const { toast } = useToast();

  const handleGoalSubmit = (track: string, goal: string) => {
    toast({
      title: "Goals Set Successfully! 🎉",
      description: `Your ${track} learning roadmap is being generated.`,
    });
  };

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "roadmap":
        return <Roadmap />;
      case "tasks":
        return <DailyTasks />;
      case "resume":
        return <ResumeAnalyzer />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {renderContent()}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleGoalSubmit}
      />
    </>
  );
};

export default Index;
