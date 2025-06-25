
import { FitnessGoal, ExperienceLevel, WorkoutDuration, Equipment, MuscleGroup } from './types';

export const FITNESS_GOALS: FitnessGoal[] = [
  FitnessGoal.BUILD_MUSCLE,
  FitnessGoal.LOSE_FAT,
  FitnessGoal.IMPROVE_ENDURANCE,
  FitnessGoal.GENERAL_FITNESS,
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  ExperienceLevel.BEGINNER,
  ExperienceLevel.INTERMEDIATE,
  ExperienceLevel.ADVANCED,
];

export const WORKOUT_DURATIONS: WorkoutDuration[] = [
  WorkoutDuration.SHORT,
  WorkoutDuration.MEDIUM,
  WorkoutDuration.LONG,
  WorkoutDuration.EXTRA_LONG,
];

export const AVAILABLE_EQUIPMENT: Equipment[] = [
  Equipment.BODYWEIGHT,
  Equipment.DUMBBELLS,
  Equipment.BARBELLS,
  Equipment.KETTLEBELLS,
  Equipment.RESISTANCE_BANDS,
  Equipment.MACHINES,
  Equipment.CARDIO_EQUIPMENT,
];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  MuscleGroup.CHEST,
  MuscleGroup.BACK,
  MuscleGroup.LEGS,
  MuscleGroup.SHOULDERS,
  MuscleGroup.BICEPS,
  MuscleGroup.TRICEPS,
  MuscleGroup.CORE,
  MuscleGroup.FULL_BODY,
];

export const DEFAULT_WORKOUT_FORM_DATA = {
  goal: FitnessGoal.GENERAL_FITNESS,
  experience: ExperienceLevel.BEGINNER,
  daysPerWeek: 3,
  duration: WorkoutDuration.MEDIUM,
  equipment: [Equipment.BODYWEIGHT],
  muscleGroups: [],
  injuries: "",
};
    