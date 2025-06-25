
export enum FitnessGoal {
  BUILD_MUSCLE = "Build Muscle",
  LOSE_FAT = "Lose Fat",
  IMPROVE_ENDURANCE = "Improve Endurance",
  GENERAL_FITNESS = "General Fitness",
}

export enum ExperienceLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
}

export enum WorkoutDuration {
  SHORT = "30 minutes",
  MEDIUM = "45 minutes",
  LONG = "60 minutes",
  EXTRA_LONG = "90 minutes",
}

export enum Equipment {
  BODYWEIGHT = "Bodyweight",
  DUMBBELLS = "Dumbbells",
  BARBELLS = "Barbells",
  KETTLEBELLS = "Kettlebells",
  RESISTANCE_BANDS = "Resistance Bands",
  MACHINES = "Gym Machines",
  CARDIO_EQUIPMENT = "Cardio Equipment (Treadmill, Bike, etc.)",
}

export enum MuscleGroup {
  CHEST = "Chest",
  BACK = "Back",
  LEGS = "Legs",
  SHOULDERS = "Shoulders",
  BICEPS = "Biceps",
  TRICEPS = "Triceps",
  CORE = "Core",
  FULL_BODY = "Full Body",
}

export interface WorkoutFormData {
  goal: FitnessGoal;
  experience: ExperienceLevel;
  daysPerWeek: number;
  duration: WorkoutDuration;
  equipment: Equipment[];
  muscleGroups: MuscleGroup[];
  injuries: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g., "8-12" or "15"
  rest: string; // e.g., "60s" or "90-120s"
}

export interface Activity {
  name: string;
  duration: string; // e.g., "5 minutes" or "30 seconds per side"
}

export interface DailyWorkout {
  day: string; // e.g., "Day 1" or "Monday"
  focus: string; // e.g., "Chest & Triceps" or "Full Body"
  warmUp: Activity[];
  exercises: Exercise[];
  coolDown: Activity[];
}

export interface GeneratedWorkoutPlan {
  plan: DailyWorkout[];
  notes?: string; 
}

export interface GeminiApiResponse {
  workoutPlan: GeneratedWorkoutPlan;
}
    