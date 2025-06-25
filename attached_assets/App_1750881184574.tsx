
import React, { useState, useCallback } from 'react';
import { WorkoutFormData, GeneratedWorkoutPlan, FitnessGoal, ExperienceLevel, WorkoutDuration, Equipment } from './types';
import { DEFAULT_WORKOUT_FORM_DATA } from './constants';
import WorkoutForm from './components/WorkoutForm';
import WorkoutDisplay from './components/WorkoutDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { generateWorkoutPlan } from './services/geminiService';

const App: React.FC = () => {
  const [formData, setFormData] = useState<WorkoutFormData>(DEFAULT_WORKOUT_FORM_DATA);
  const [workoutPlan, setWorkoutPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = useCallback((newFormData: Partial<WorkoutFormData>) => {
    setFormData(prev => ({ ...prev, ...newFormData }));
  }, []);
  
  const handleEquipmentChange = useCallback((equipmentName: Equipment, checked: boolean) => {
    setFormData(prev => {
      const newEquipment = checked
        ? [...prev.equipment, equipmentName]
        : prev.equipment.filter(e => e !== equipmentName);
      return { ...prev, equipment: newEquipment };
    });
  }, []);

  const handleMuscleGroupChange = useCallback((muscleGroupName: any, checked: boolean) => { // Use 'any' for muscleGroupName as it can be MuscleGroup
    setFormData(prev => {
      const newMuscleGroups = checked
        ? [...prev.muscleGroups, muscleGroupName]
        : prev.muscleGroups.filter(m => m !== muscleGroupName);
      return { ...prev, muscleGroups: newMuscleGroups };
    });
  }, []);


  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setWorkoutPlan(null);
    try {
      const plan = await generateWorkoutPlan(formData);
      setWorkoutPlan(plan);
    } catch (err) {
      console.error("Error generating plan:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating the plan. Please ensure your API key is configured correctly.");
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleClearForm = useCallback(() => {
    setFormData(DEFAULT_WORKOUT_FORM_DATA);
    setWorkoutPlan(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-primary">
            <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3.32 6.176A.75.75 0 0 0 3 6.82V17.18a.75.75 0 0 0 .32.643l8.302 4.576a.75.75 0 0 0 .756 0l8.302-4.576a.75.75 0 0 0 .32-.643V6.82a.75.75 0 0 0-.32-.643L12.378 1.602ZM12 3.135l7.128 3.927L12 10.99 4.872 7.062 12 3.135ZM4.5 8.411l7.508 4.136v7.322l-7.508-4.136V8.41ZM19.5 8.411v7.322l-7.508 4.136V12.547L19.5 8.41Z" />
          </svg>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            FitForge AI
          </h1>
        </div>
        <p className="text-slate-400 mt-2 text-lg">Your Personal AI Fitness Planner</p>
      </header>

      <div className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-lg p-6 md:p-8">
        <WorkoutForm
          formData={formData}
          onFormChange={handleFormChange}
          onEquipmentChange={handleEquipmentChange}
          onMuscleGroupChange={handleMuscleGroupChange}
          onSubmit={handleSubmit}
          onClear={handleClearForm}
          isLoading={isLoading}
        />
        
        {isLoading && (
          <div className="mt-8 flex justify-center">
            <LoadingSpinner />
          </div>
        )}
        {error && (
          <div className="mt-8">
            <ErrorMessage message={error} />
          </div>
        )}
        {workoutPlan && !isLoading && !error && (
          <div className="mt-8">
            <WorkoutDisplay plan={workoutPlan} />
          </div>
        )}
        {!workoutPlan && !isLoading && !error && (
            <div className="mt-8 text-center text-slate-500 py-10 border-2 border-dashed border-slate-700 rounded-lg">
                <p className="text-lg">Your personalized workout plan will appear here.</p>
                <p>Fill out the form above and click "Forge My Plan"!</p>
            </div>
        )}
      </div>
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} FitForge AI. Unleash your potential.</p>
      </footer>
    </div>
  );
};

export default App;
    