import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import WorkoutForm from "@/components/WorkoutForm";
import WorkoutDisplay from "@/components/WorkoutDisplay";
import { WorkoutFormData, GeneratedWorkoutPlan } from "@/types";

export default function WorkoutPlanner() {
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generatePlanMutation = useMutation({
    mutationFn: async (formData: WorkoutFormData) => {
      const response = await apiRequest('POST', '/api/workout-plans', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPlan(data);
      queryClient.invalidateQueries({ queryKey: ['/api/workout-plans'] });
      toast({
        title: "Success!",
        description: "Your workout plan has been generated and saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate workout plan",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (formData: WorkoutFormData) => {
    generatePlanMutation.mutate(formData);
  };

  const handleSavePlan = () => {
    toast({
      title: "Saved!",
      description: "Your workout plan has been saved to your library.",
    });
  };

  const handleSharePlan = () => {
    // Copy share link to clipboard
    const shareUrl = `${window.location.origin}/community`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Shared!",
      description: "Share link copied to clipboard.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">AI Workout Planner</h1>
        <p className="text-slate-400">Create your personalized workout plan powered by AI</p>
      </div>

      <div className="space-y-8">
        <WorkoutForm 
          onSubmit={handleFormSubmit}
          isLoading={generatePlanMutation.isPending}
        />
        
        {generatePlanMutation.isPending && (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-400 text-lg">Forging your personalized plan...</p>
              <p className="text-slate-500 text-sm mt-2">This may take a few moments</p>
            </div>
          </div>
        )}

        {generatedPlan && !generatePlanMutation.isPending && (
          <WorkoutDisplay
            plan={generatedPlan}
            onSave={handleSavePlan}
            onShare={handleSharePlan}
          />
        )}

        {!generatedPlan && !generatePlanMutation.isPending && (
          <div className="text-center text-slate-500 py-12 border-2 border-dashed border-slate-700 rounded-lg">
            <p className="text-lg">Your personalized workout plan will appear here.</p>
            <p>Fill out the form above and click "Forge My Plan"!</p>
          </div>
        )}
      </div>
    </div>
  );
}
