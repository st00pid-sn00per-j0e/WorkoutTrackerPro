
import React from 'react';
import { GeneratedWorkoutPlan, DailyWorkout, Exercise, Activity } from '../types';

interface WorkoutDisplayProps {
  plan: GeneratedWorkoutPlan;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-md font-semibold text-primary-light mt-4 mb-2">{children}</h4>
);

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => (
  <li className="text-sm text-slate-300">
    <span className="font-medium">{activity.name}:</span> {activity.duration}
  </li>
);

const ExerciseItem: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
  <li className="text-sm text-slate-300 py-1">
    <span className="font-medium text-slate-100">{exercise.name}:</span> {exercise.sets} sets x {exercise.reps} reps, {exercise.rest} rest
  </li>
);

const DailyWorkoutCard: React.FC<{ dailyWorkout: DailyWorkout }> = ({ dailyWorkout }) => (
  <div className="bg-slate-700 p-4 rounded-lg shadow-md">
    <h3 className="text-xl font-bold text-slate-100 mb-1">{dailyWorkout.day}</h3>
    <p className="text-sm text-accent mb-3 font-medium">{dailyWorkout.focus}</p>
    
    {dailyWorkout.warmUp && dailyWorkout.warmUp.length > 0 && (
      <>
        <SectionTitle>Warm-up</SectionTitle>
        <ul className="list-disc list-inside space-y-1 pl-2">
          {dailyWorkout.warmUp.map((activity, index) => <ActivityItem key={`warmup-${index}`} activity={activity} />)}
        </ul>
      </>
    )}

    {dailyWorkout.exercises && dailyWorkout.exercises.length > 0 && (
       <>
        <SectionTitle>Workout</SectionTitle>
        <ul className="space-y-1">
          {dailyWorkout.exercises.map((exercise, index) => <ExerciseItem key={`exercise-${index}`} exercise={exercise} />)}
        </ul>
       </>
    )}

    {dailyWorkout.coolDown && dailyWorkout.coolDown.length > 0 && (
      <>
        <SectionTitle>Cool-down</SectionTitle>
        <ul className="list-disc list-inside space-y-1 pl-2">
          {dailyWorkout.coolDown.map((activity, index) => <ActivityItem key={`cooldown-${index}`} activity={activity} />)}
        </ul>
      </>
    )}
  </div>
);

const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ plan }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-slate-100 mb-6">Your Forged Workout Plan</h2>
      
      {plan.notes && (
        <div className="bg-slate-700 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-primary-light mb-2">Trainer's Notes:</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{plan.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plan.plan.map((dailyWorkout, index) => (
          <DailyWorkoutCard key={index} dailyWorkout={dailyWorkout} />
        ))}
      </div>
    </div>
  );
};

export default WorkoutDisplay;
    