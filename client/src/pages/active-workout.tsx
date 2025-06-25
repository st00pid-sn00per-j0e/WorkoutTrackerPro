import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import WorkoutTimer from "@/components/WorkoutTimer";
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  Circle,
  Clock,
  Flame,
  Target
} from "lucide-react";
import { WorkoutSession, DailyWorkout, Exercise } from "@/types";

export default function ActiveWorkout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number[]>>({});
  const [repsInput, setRepsInput] = useState<string>("");
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRestMode, setIsRestMode] = useState(false);

  // Mock workout data - in real app this would come from selected workout plan
  const mockWorkout: DailyWorkout = {
    day: "Day 1",
    focus: "Chest & Triceps",
    warmUp: [
      { name: "Jumping Jacks", duration: "2 minutes" },
      { name: "Dynamic Chest Stretches", duration: "1 minute" }
    ],
    exercises: [
      { name: "Push-ups", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Dumbbell Bench Press", sets: 3, reps: "8-12", rest: "90s" },
      { name: "Dumbbell Flyes", sets: 3, reps: "10-12", rest: "60s" },
      { name: "Tricep Dips", sets: 3, reps: "8-10", rest: "60s" },
      { name: "Overhead Press", sets: 3, reps: "8-12", rest: "90s" }
    ],
    coolDown: [
      { name: "Static Chest Stretch", duration: "30s per side" },
      { name: "Triceps Stretch", duration: "30s per side" }
    ]
  };

  // Get active workout session
  const { data: activeSession } = useQuery({
    queryKey: ['/api/workout-sessions/active'],
    retry: false,
  });

  // Create workout session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/workout-sessions', {
        title: mockWorkout.focus,
        status: 'active'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSessionStartTime(new Date(data.startTime));
      queryClient.invalidateQueries({ queryKey: ['/api/workout-sessions/active'] });
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
        description: "Failed to start workout session",
        variant: "destructive",
      });
    },
  });

  // Update workout session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!activeSession?.id) throw new Error("No active session");
      const response = await apiRequest('PATCH', `/api/workout-sessions/${activeSession.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workout-sessions'] });
    },
  });

  // Timer for elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000 / 60);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Start workout session if none exists
  useEffect(() => {
    if (!activeSession && !createSessionMutation.isPending) {
      createSessionMutation.mutate();
    }
  }, [activeSession, createSessionMutation]);

  const currentExercise = mockWorkout.exercises[currentExerciseIndex];
  const totalExercises = mockWorkout.exercises.length;
  const overallProgress = ((currentExerciseIndex + (currentSetIndex + 1) / currentExercise?.sets) / totalExercises) * 100;

  const handleCompleteSet = () => {
    if (!currentExercise || !repsInput) return;

    const reps = parseInt(repsInput);
    const exerciseKey = `${currentExerciseIndex}-${currentExercise.name}`;
    
    setCompletedSets(prev => ({
      ...prev,
      [exerciseKey]: [...(prev[exerciseKey] || []), reps]
    }));

    setRepsInput("");

    // Move to next set or exercise
    if (currentSetIndex + 1 < currentExercise.sets) {
      setCurrentSetIndex(prev => prev + 1);
      setIsRestMode(true);
    } else {
      // Move to next exercise
      if (currentExerciseIndex + 1 < totalExercises) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        setIsRestMode(true);
      } else {
        // Workout complete
        handleCompleteWorkout();
      }
    }
  };

  const handleCompleteWorkout = () => {
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60);
    
    updateSessionMutation.mutate({
      endTime,
      duration,
      status: 'completed',
      exercisesCompleted: completedSets,
      caloriesBurned: Math.floor(duration * 8) // Rough estimate
    });

    toast({
      title: "Workout Complete! 🎉",
      description: `Great job! You completed your ${mockWorkout.focus} workout in ${duration} minutes.`,
    });
  };

  const handleEndWorkout = () => {
    if (activeSession) {
      updateSessionMutation.mutate({
        endTime: new Date(),
        status: 'completed',
        duration: elapsedTime,
        exercisesCompleted: completedSets
      });
    }
    toast({
      title: "Workout Ended",
      description: "Your workout session has been saved.",
    });
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentSetIndex(0);
      setIsRestMode(false);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      setIsRestMode(false);
    }
  };

  const getRestDuration = (restString: string): number => {
    const match = restString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60;
  };

  const exerciseKey = currentExercise ? `${currentExerciseIndex}-${currentExercise.name}` : "";
  const completedSetsForExercise = completedSets[exerciseKey] || [];

  if (!currentExercise) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">No Active Workout</h1>
          <p className="text-slate-400 mb-6">Start a workout from your dashboard or workout planner.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Workout Header */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{mockWorkout.focus}</h1>
              <p className="text-slate-400">{mockWorkout.day} • {mockWorkout.focus}</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleEndWorkout}
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="mr-2 h-4 w-4" />
              End Workout
            </Button>
          </div>
          
          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{elapsedTime}m</div>
              <div className="text-sm text-slate-400">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{Math.floor(elapsedTime * 8)}</div>
              <div className="text-sm text-slate-400">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {currentExerciseIndex + 1}/{totalExercises}
              </div>
              <div className="text-sm text-slate-400">Exercises</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Exercise */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-slate-100">{currentExercise.name}</CardTitle>
              <p className="text-slate-400">
                Set {currentSetIndex + 1} of {currentExercise.sets} • {currentExercise.reps} reps
              </p>
            </div>
            <Badge variant="outline" className="text-slate-300">
              {currentExercise.rest} rest
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Exercise Demo Placeholder */}
          <div className="bg-slate-900 rounded-lg overflow-hidden">
            <div className="aspect-video bg-slate-700 flex items-center justify-center">
              <div className="text-center">
                <Play className="mx-auto h-12 w-12 text-primary mb-2" />
                <p className="text-slate-300">Exercise Demonstration</p>
                <p className="text-xs text-slate-500">{currentExercise.name} form guide</p>
              </div>
            </div>
          </div>

          {/* Rest Timer */}
          {isRestMode && (
            <WorkoutTimer
              initialDuration={getRestDuration(currentExercise.rest)}
              exerciseName={currentExercise.name}
              sessionId={activeSession?.id || "mock-session"}
              onTimerComplete={() => setIsRestMode(false)}
            />
          )}

          {/* Set Tracking */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-100">Set Progress</h4>
            {[...Array(currentExercise.sets)].map((_, setIndex) => (
              <div 
                key={setIndex}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  setIndex < completedSetsForExercise.length
                    ? 'bg-green-900/20 border-green-700'
                    : setIndex === currentSetIndex
                    ? 'bg-primary/20 border-primary'
                    : 'bg-slate-700 border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {setIndex < completedSetsForExercise.length ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : setIndex === currentSetIndex ? (
                    <Circle className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-600" />
                  )}
                  <span className="text-slate-100">Set {setIndex + 1}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  {setIndex < completedSetsForExercise.length ? (
                    <span className="text-slate-300">
                      {completedSetsForExercise[setIndex]} reps
                    </span>
                  ) : setIndex === currentSetIndex && !isRestMode ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={repsInput}
                        onChange={(e) => setRepsInput(e.target.value)}
                        className="w-20 bg-slate-600 border-slate-500 text-center"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleCompleteSet}
                        disabled={!repsInput}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-slate-500">{currentExercise.reps} reps</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handlePreviousExercise}
              disabled={currentExerciseIndex === 0}
              className="border-slate-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button 
              onClick={handleNextExercise}
              disabled={currentExerciseIndex >= totalExercises - 1}
            >
              Next Exercise
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workout Progress */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Today's Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockWorkout.exercises.map((exercise, index) => {
              const exerciseCompletedSets = completedSets[`${index}-${exercise.name}`] || [];
              const isCompleted = exerciseCompletedSets.length === exercise.sets;
              const isCurrent = index === currentExerciseIndex;
              
              return (
                <div 
                  key={exercise.name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCompleted ? 'bg-green-900/20' :
                    isCurrent ? 'bg-primary/20' :
                    'bg-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isCurrent ? (
                      <Circle className="h-5 w-5 text-primary animate-pulse" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600" />
                    )}
                    <span className="text-slate-100">{exercise.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-300">
                      {exerciseCompletedSets.length}/{exercise.sets} sets
                    </div>
                    <div className="text-xs text-slate-400">
                      {exercise.sets}×{exercise.reps}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
