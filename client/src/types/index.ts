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
  CARDIO_EQUIPMENT = "Cardio Equipment",
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
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  daysPerWeek: number;
  duration: WorkoutDuration;
  equipment: Equipment[];
  muscleGroups: MuscleGroup[];
  injuries: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface Activity {
  name: string;
  duration: string;
}

export interface DailyWorkout {
  day: string;
  focus: string;
  warmUp: Activity[];
  exercises: Exercise[];
  coolDown: Activity[];
}

export interface GeneratedWorkoutPlan {
  plan: DailyWorkout[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  caloriesBurned?: number;
  exercisesCompleted: any;
  status: 'active' | 'completed' | 'paused';
}

export interface Meal {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  instructions?: string;
}

export interface DailyMeals {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snacks?: Meal[];
}

export interface NutritionPlan {
  id: string;
  title: string;
  fitnessGoal: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
  meals: DailyMeals;
  isActive: boolean;
}

export interface NutritionLog {
  id: string;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  waterGlasses: number;
  meals?: any;
}

export interface UserProgress {
  id: string;
  date: Date;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  weeklyWorkouts: number;
  currentStreak: number;
  totalCaloriesBurned: number;
  averageSessionDuration: number;
}

export interface WorkoutTimerMessage {
  type: 'timer_start' | 'timer_pause' | 'timer_reset' | 'timer_update';
  sessionId?: string;
  duration?: number;
  exerciseId?: string;
}
